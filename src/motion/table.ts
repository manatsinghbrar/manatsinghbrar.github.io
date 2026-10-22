// The signature: the work index behaves like the data table it describes.
//   - Sortable headers (#, Work, Area, Level). Rows slide to their new order (FLIP).
//   - Search wraps matches in <mark> and dims the rows that miss. Nothing reflows.
// The markup is a real <table> that reads and links without JS (WorkTable.astro).
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ease, onPage, prefersReducedMotion } from '../engine';

gsap.registerPlugin(Flip);

type SortKey = 'index' | 'title' | 'area' | 'level';
type Row = { el: HTMLTableRowElement; cells: { el: HTMLElement; text: string }[] };

const MAX_QUERY = 40;

function compare(key: SortKey) {
  return (a: HTMLElement, b: HTMLElement) => {
    const index = Number(a.dataset.index) - Number(b.dataset.index);
    if (key === 'index') return index;
    if (key === 'level') return Number(a.dataset.level) - Number(b.dataset.level) || index;
    return (a.dataset[key] ?? '').localeCompare(b.dataset[key] ?? '', 'en') || index;
  };
}

/** Rewrite `el` as `text` with every case-insensitive match of `needle` wrapped in <mark>.
 *  Built from text nodes, so the query is never parsed as HTML. */
function highlight(el: HTMLElement, text: string, needle: string) {
  const lower = text.toLowerCase();
  let at = needle ? lower.indexOf(needle) : -1;
  if (at < 0) {
    if (el.firstElementChild) el.textContent = text;
    return false;
  }
  const parts: Node[] = [];
  let from = 0;
  while (at >= 0) {
    if (at > from) parts.push(document.createTextNode(text.slice(from, at)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(at, at + needle.length);
    parts.push(mark);
    from = at + needle.length;
    at = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(document.createTextNode(text.slice(from)));
  el.replaceChildren(...parts);
  return true;
}

function initTable(root: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>('[data-rows]');
  const input = root.querySelector<HTMLInputElement>('[data-search]');
  const count = root.querySelector<HTMLElement>('[data-count]');
  if (!body || !input || !count) return;

  const rows: Row[] = [...body.querySelectorAll<HTMLTableRowElement>('[data-row]')].map((el) => ({
    el,
    cells: [...el.querySelectorAll<HTMLElement>('[data-hl]')].map((c) => ({ el: c, text: c.textContent ?? '' })),
  }));
  const total = rows.length;
  const reduced = prefersReducedMotion();

  // ── Search ─────────────────────────────────────────────────────────────────────────────
  function search(query: string) {
    const needle = query.trim().slice(0, MAX_QUERY).toLowerCase();
    let matches = 0;
    for (const row of rows) {
      let hit = false;
      for (const c of row.cells) hit = highlight(c.el, c.text, needle) || hit;
      row.el.classList.toggle('is-dim', needle !== '' && !hit);
      if (hit) matches++;
    }
    count!.textContent = needle ? `${matches} of ${total} rows match` : `${total} rows`;
    root.classList.toggle('is-searching', needle !== '');
  }

  input.addEventListener('input', () => search(input.value));

  // ── Sort ───────────────────────────────────────────────────────────────────────────────
  const headers = [...root.querySelectorAll<HTMLElement>('th[data-sort-col]')];
  let sortKey: SortKey = 'index';
  let ascending = true;

  function sort(key: SortKey) {
    ascending = key === sortKey ? !ascending : true;
    sortKey = key;
    const order = rows.map((r) => r.el).sort(compare(key));
    if (!ascending) order.reverse();

    for (const th of headers) {
      if (th.dataset.sortCol === key) th.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    }

    if (reduced) {
      body!.append(...order);
      return;
    }
    const state = Flip.getState(order);
    body!.append(...order);
    Flip.from(state, { duration: 0.6, ease: ease.out, stagger: 0.03 });
  }

  root.querySelectorAll<HTMLButtonElement>('[data-sort]').forEach((button) => {
    button.addEventListener('click', () => sort(button.dataset.sort as SortKey));
  });
}

export function registerTable() {
  onPage(() => {
    const root = document.querySelector<HTMLElement>('[data-table-root]');
    if (root) initTable(root);
  });
}
