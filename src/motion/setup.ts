// Global motion for this site: runs once on the client, before the first page initializes.
//   - Curtain: six ink rows fill from the left (a table filling) and leave the same way.
//   - Row to case: the clicked table row grows to fill the screen, then settles into the case
//     header of the next page (shared-element feel without a second DOM copy).
//   - Case to home (back link or browser back): the same move reversed, the case header grows
//     to fill the screen, then shrinks into the row it came from.
//   - Header (always visible): Bangalore clock, nav current-section underline, phone menu.
import { ease, onPage, scrollToTarget, setShown, setTransition, tween, wait } from '../engine';
import type { Transition } from '../engine/transition';
import { site } from '../data/site';
import { registerTable } from './table';

// ── Transition ───────────────────────────────────────────────────────────────────────────

// The row whose link started the navigation. Only a plain left click counts (a modified click
// opens a tab and never navigates here), and it expires so a stale row never drives a later
// back/forward navigation.
let pendingRow: { el: HTMLElement; at: number } | null = null;
let mode: 'rows' | 'expand' | 'collapse' = 'rows';
// Paths of the navigation in flight (set on astro:before-preparation), and the case a collapse
// returns to.
let nav: { from: string; to: string } | null = null;
let collapseSlug = '';
// The path of the page on screen. On back/forward, `location` already holds the destination by
// the time astro:before-preparation fires, so the page lifecycle tracks it instead.
let here = '';
const caseSlug = (path: string) => /^\/work\/([^/]+)\/?$/.exec(path)?.[1] ?? '';

function rememberRow(e: MouseEvent) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[data-row-link]');
  if (!link) return;
  const row = link.closest<HTMLElement>('[data-row]') ?? link;
  pendingRow = { el: row, at: performance.now() };
}

// Whole-row click for the work table: forwards to the title link so the router and expand run.
function openRow(e: MouseEvent) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const target = e.target as Element | null;
  if (!target?.closest || target.closest('a')) return;
  if (!(getSelection()?.isCollapsed ?? true)) return; // let people select text in a row
  target.closest('tr[data-row]')?.querySelector<HTMLAnchorElement>('a[data-row-link]')?.click();
}

function takeRow() {
  const p = pendingRow;
  pendingRow = null;
  return p && performance.now() - p.at < 1000 && p.el.isConnected ? p.el : null;
}

const px = (n: number) => `${Math.max(0, Math.round(n))}px`;
const insetOf = (r: DOMRect) => {
  const vw = document.documentElement.clientWidth;
  const vh = innerHeight;
  return `inset(${px(r.top)} ${px(vw - r.right)} ${px(vh - r.bottom)} ${px(r.left)})`;
};
const FULL = 'inset(0px 0px 0px 0px)';
const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const parts = (c: HTMLElement) => ({
  rows: [...c.querySelectorAll<HTMLElement>('.curtain__row')],
  panel: c.querySelector<HTMLElement>('.curtain__expand')!,
});
// The six ink rows scale across from `origin` (stagger 40 ms).
const sweep = (rows: HTMLElement[], from: number, to: number, origin: string) => Promise.all(rows.map((r, i) => {
  r.style.transformOrigin = origin;
  return tween(r, { transform: `scaleX(${from})` }, { transform: `scaleX(${to})` }, { duration: 500, delay: i * 40, easing: ease.inOut });
}));
async function fadeOut(panel: HTMLElement) {
  await tween(panel, { opacity: '1' }, { opacity: '0' }, { duration: 300, easing: ease.soft });
  setShown(panel, false);
}

const rowsTransition: Transition = {
  async leave(c) {
    const { rows, panel } = parts(c);
    const row = takeRow();
    const slug = !row && nav?.to === '/' ? caseSlug(nav.from) : '';
    const head = slug ? document.querySelector<HTMLElement>('[data-case-head]') : null;
    nav = null;
    if (row || head) {
      // Expand grows the clicked row; collapse grows the case header. Either fills the screen.
      mode = row ? 'expand' : 'collapse';
      if (head) collapseSlug = slug;
      rows.forEach((r) => { r.style.transform = 'scaleX(0)'; });
      setShown(c, true);
      setShown(panel, true);
      const surface = cssVar('--c-surface');
      await tween(panel,
        { clipPath: insetOf((row ?? head!).getBoundingClientRect()), backgroundColor: row ? cssVar('--c-hit') : surface },
        { clipPath: FULL, backgroundColor: surface },
        { duration: row ? 700 : 600, easing: ease.inOut });
      return;
    }
    mode = 'rows';
    setShown(panel, false);
    setShown(c, true);
    await sweep(rows, 0, 1, '0% 50%');
  },
  async enter(c, startIntro) {
    const { rows, panel } = parts(c);
    if (mode === 'expand') {
      const head = document.querySelector<HTMLElement>('[data-case-head]');
      if (head) {
        void tween(panel, { clipPath: FULL }, { clipPath: insetOf(head.getBoundingClientRect()) }, { duration: 600, easing: ease.out });
        await wait(400);
      }
      // The title rises as the panel fades, so the header is never shown empty.
      startIntro();
      await fadeOut(panel);
      setShown(c, false);
      return;
    }
    if (mode === 'collapse') {
      const link = document.querySelector<HTMLElement>(`a[data-row-link][href="/work/${CSS.escape(collapseSlug)}/"]`);
      const row = link?.closest<HTMLElement>('[data-row]');
      if (row) {
        // Browser back already restored the scroll position; the back link lands on #work, so
        // bring the row into view if it is not.
        const r = row.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight) row.scrollIntoView({ block: 'center', behavior: 'instant' });
        void tween(panel,
          { clipPath: FULL, backgroundColor: cssVar('--c-surface') },
          { clipPath: insetOf(row.getBoundingClientRect()), backgroundColor: cssVar('--c-hit') },
          { duration: 600, easing: ease.out });
        await wait(500);
      }
      await fadeOut(panel);
      setShown(c, false);
      return;
    }
    await sweep(rows, 1, 0, '100% 50%');
    setShown(c, false);
  },
};

// ── Header ───────────────────────────────────────────────────────────────────────────────

const clockFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', hour12: false, timeZone: site.tz,
});

function startClock() {
  const el = document.querySelector<HTMLElement>('[data-clock]');
  if (!el) return;
  let timer = 0;
  const tick = () => {
    const now = new Date();
    el.textContent = clockFormat.format(now);
    el.setAttribute('datetime', now.toISOString());
    timer = window.setTimeout(tick, (60 - now.getSeconds()) * 1000 + 50); // next minute boundary
  };
  tick();
  el.closest('.clock')?.classList.add('is-live');
  return () => clearTimeout(timer);
}

// Phone menu: the button toggles the panel. It closes on Escape (focus returns to the button),
// on a click outside the header, and when a link in the panel is chosen.
function initMenu() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const button = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  if (!header || !button) return;
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  const set = (open: boolean) => {
    header.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  };
  const onButton = () => set(!isOpen());
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !isOpen()) return;
    set(false);
    button.focus();
  };
  const onDocClick = (e: MouseEvent) => {
    if (!isOpen()) return;
    const target = e.target as Element | null;
    if (!target || !header.contains(target) || target.closest('#site-menu a')) set(false);
  };
  button.addEventListener('click', onButton);
  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onDocClick);
  return () => {
    button.removeEventListener('click', onButton);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onDocClick);
  };
}

// On the home page the nav underline follows the section crossing the middle of the screen.
function initNavCurrent() {
  if (location.pathname !== '/') return;
  const links = new Map<Element, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((link) => {
    const section = document.getElementById(link.dataset.nav!);
    if (section) links.set(section, link);
  });
  // The root is a zero-height line across the middle of the viewport.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) links.get(e.target)?.classList.toggle('is-current', e.isIntersecting);
  }, { rootMargin: '-50% 0px -50% 0px' });
  links.forEach((_, section) => io.observe(section));
  return () => io.disconnect();
}

// Arriving at /#section from another page: enter() resets to the top, so jump to the section.
// In-page hash links on home are left to ClientRouter and native scroll. Back/forward keeps the
// scroll position ClientRouter restored.
let traversing = false;
function jumpToHash() {
  if (!location.hash || traversing) return;
  const section = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (section) scrollToTarget(section);
}

export function setupMotion() {
  setTransition(rowsTransition);
  document.addEventListener('click', rememberRow, { capture: true });
  document.addEventListener('click', openRow);
  document.addEventListener('astro:before-preparation', (e) => {
    nav = { from: here, to: e.to.pathname };
    traversing = e.navigationType === 'traverse';
  });

  onPage(({ path }) => {
    here = path;
    // Case pages always open at the top, even on back/forward or reload (the router restores scroll).
    if (caseSlug(path)) scrollTo(0, 0);
    jumpToHash();
    const stopClock = startClock();
    const stopMenu = initMenu();
    const stopNav = initNavCurrent();
    return () => {
      stopClock?.();
      stopMenu?.();
      stopNav?.();
    };
  });

  registerTable();
}
