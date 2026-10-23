// Declarative motion through data attributes. Authoring happens in markup:
//   data-split="lines"   text reveal: wipes up out of its own box (one block, not per line)
//   data-reveal="up|fade" block reveal
//   data-intro           play with the page intro instead of on scroll
//   data-delay="0.2"     extra delay (seconds)
// The look lives in engine.css; this file only adds .is-in when an element should show.
// Every effect is skipped under reduced motion; CSS keeps content visible without JS.
import { prefersReducedMotion } from './env';

// Phones: a reveal that starts at 90% of a short viewport lands after the reader got there.
const compact = () => matchMedia('(max-width: 760px)').matches;

export type Reveals = { playIntro: (instant: boolean) => void; stop: () => void };

// `instant` shows the end state with no transition (back/forward arrivals, content already
// scrolled past): the visitor has seen this page, and a half-revealed block reads as broken.
function show(el: Element, instant: boolean) {
  if (instant) el.classList.add('is-instant');
  el.classList.add('is-in');
}

/** Wire every reveal inside `root`. Scroll reveals start now; intro reveals wait for playIntro. */
export function initReveals(root: ParentNode = document): Reveals {
  if (prefersReducedMotion()) return { playIntro() {}, stop() {} };
  const intro: HTMLElement[] = [];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const above = e.boundingClientRect.top < 0;
      if (!e.isIntersecting && !above) continue; // still below the reveal line
      show(e.target, !e.isIntersecting);
      io.unobserve(e.target);
    }
  }, { rootMargin: compact() ? '0px 0px -2% 0px' : '0px 0px -10% 0px' });

  root.querySelectorAll<HTMLElement>('[data-split], [data-reveal]').forEach((el) => {
    const delay = parseFloat(el.dataset.delay || '0');
    if (delay > 0) el.style.transitionDelay = `${delay}s`;
    if (el.hasAttribute('data-intro')) intro.push(el);
    else io.observe(el);
  });

  return {
    playIntro: (instant) => intro.forEach((el) => show(el, instant)),
    stop: () => io.disconnect(),
  };
}
