// Global motion for this site: runs once on the client, before the first page initializes.
//   - Curtain: six ink rows fill from the left (a table filling) and leave the same way.
//   - Row to case: the clicked table row grows to fill the screen, then settles into the case
//     header of the next page (shared-element feel without a second DOM copy).
//   - Case to home (back link or browser back): the same move reversed, the case header grows
//     to fill the screen, then shrinks into the row it came from.
//   - Header (always visible): Bangalore clock, nav current-section underline, phone menu.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, onPage, scrollToTarget, setTransition } from '../engine';
import { site } from '../data/site';
import { registerTable } from './table';

gsap.registerPlugin(ScrollTrigger);

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

const rowsTransition = {
  leave(c: HTMLElement) {
    const rows = c.querySelectorAll('.curtain__row');
    const panel = c.querySelector('.curtain__expand');
    const row = takeRow();
    if (row) {
      mode = 'expand';
      return gsap.timeline()
        .set(rows, { scaleX: 0 })
        .set(c, { autoAlpha: 1 })
        .fromTo(panel,
          { autoAlpha: 1, clipPath: insetOf(row.getBoundingClientRect()), backgroundColor: cssVar('--c-hit') },
          { clipPath: FULL, backgroundColor: cssVar('--c-surface'), duration: 0.7, ease: ease.inOut });
    }
    const slug = nav?.to === '/' ? caseSlug(nav.from) : '';
    const head = document.querySelector<HTMLElement>('[data-case-head]');
    nav = null;
    if (slug && head) {
      mode = 'collapse';
      collapseSlug = slug;
      return gsap.timeline()
        .set(rows, { scaleX: 0 })
        .set(c, { autoAlpha: 1 })
        .fromTo(panel,
          { autoAlpha: 1, clipPath: insetOf(head.getBoundingClientRect()), backgroundColor: cssVar('--c-surface') },
          { clipPath: FULL, duration: 0.6, ease: ease.inOut });
    }
    mode = 'rows';
    return gsap.timeline()
      .set(panel, { autoAlpha: 0 })
      .set(c, { autoAlpha: 1 })
      .fromTo(rows, { scaleX: 0, transformOrigin: '0% 50%' },
        { scaleX: 1, duration: 0.5, stagger: 0.04, ease: ease.inOut });
  },
  enter(c: HTMLElement, startIntro: () => void) {
    const panel = c.querySelector('.curtain__expand');
    if (mode === 'expand') {
      const head = document.querySelector<HTMLElement>('[data-case-head]');
      const tl = gsap.timeline();
      if (head) tl.to(panel, { clipPath: insetOf(head.getBoundingClientRect()), duration: 0.6, ease: ease.out });
      // The title rises as the panel fades, so the header is never shown empty.
      return tl
        .call(startIntro, undefined, head ? '-=0.2' : 0)
        .to(panel, { autoAlpha: 0, duration: 0.3, ease: ease.soft }, '<')
        .set(c, { autoAlpha: 0 });
    }
    if (mode === 'collapse') {
      const link = document.querySelector<HTMLElement>(`a[data-row-link][href="/work/${CSS.escape(collapseSlug)}/"]`);
      const row = link?.closest<HTMLElement>('[data-row]');
      const tl = gsap.timeline();
      if (row) {
        // Browser back already restored the scroll position; the back link lands on #work, so
        // bring the row into view if it is not.
        const r = row.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight) row.scrollIntoView({ block: 'center', behavior: 'instant' });
        tl.to(panel, {
          clipPath: insetOf(row.getBoundingClientRect()), backgroundColor: cssVar('--c-hit'), duration: 0.6, ease: ease.out,
        });
      }
      return tl
        .to(panel, { autoAlpha: 0, duration: 0.3, ease: ease.soft }, row ? '-=0.1' : 0)
        .set(c, { autoAlpha: 0 });
    }
    return gsap.timeline()
      .to(c.querySelectorAll('.curtain__row'), {
        scaleX: 0, transformOrigin: '100% 50%', duration: 0.5, stagger: 0.04, ease: ease.inOut,
      })
      .set(c, { autoAlpha: 0 });
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
    // Wall-clock timer: gsap's lag smoothing would hold a background tab's clock up to a minute behind.
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

// On the home page the nav underline follows the section in view.
function initNavCurrent() {
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((link) => {
    const section = document.getElementById(link.dataset.nav!);
    if (!section || location.pathname !== '/') return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-current', self.isActive),
    });
  });
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
  document.addEventListener('astro:before-preparation', (e) => {
    nav = { from: here, to: e.to.pathname };
    traversing = e.navigationType === 'traverse';
  });

  onPage(({ path }) => {
    here = path;
    jumpToHash();
    const stopClock = startClock();
    const stopMenu = initMenu();
    initNavCurrent();
    return () => {
      stopClock?.();
      stopMenu?.();
    };
  });

  registerTable();
}
