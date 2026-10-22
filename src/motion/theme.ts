// Light / dark theme toggle (header button). Light is the default; a choice to go dark is kept
// in localStorage. The inline script in Base.astro applies the stored choice before first paint;
// this module handles the button and carries the theme across ClientRouter swaps.
// Storage can throw (private mode, blocked site data): every access is guarded, and the toggle
// still works for the current visit without it.

type Theme = 'light' | 'dark';

const KEY = 'theme';
const BAR = { light: '#ECEEF1', dark: '#0F1115' } as const; // browser UI colour, = --c-ground

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

function applyTo(doc: Document, theme: Theme) {
  if (theme === 'dark') doc.documentElement.dataset.theme = 'dark';
  else delete doc.documentElement.dataset.theme;
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR[theme]);
}

function syncButtons() {
  const pressed = String(current() === 'dark');
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', pressed));
}

function store(theme: Theme) {
  try {
    if (theme === 'dark') localStorage.setItem(KEY, 'dark');
    else localStorage.removeItem(KEY);
  } catch {
    /* not persisted; the choice still holds until the tab closes the page */
  }
}

let started = false;

export function setupTheme() {
  if (started) return;
  started = true;

  document.addEventListener('click', (e) => {
    const button = (e.target as Element | null)?.closest('[data-theme-toggle]');
    if (!button) return;
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    applyTo(document, next);
    store(next);
    syncButtons();
  });

  // Astro replaces <html> attributes on navigation: stamp the theme on the incoming document
  // before it swaps in, so the next page never paints in the other theme.
  document.addEventListener('astro:before-swap', (e) => applyTo(e.newDocument, current()));
  document.addEventListener('astro:page-load', syncButtons);
  syncButtons();
}
