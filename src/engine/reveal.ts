// Declarative motion through data attributes. Authoring happens in markup:
//   data-split="lines|words|chars"   masked text reveal (SplitText), on scroll or on intro
//   data-reveal="up|fade"             block reveal
//   data-intro                        play with the page intro instead of on scroll
//   data-delay="0.2"                  extra delay (seconds)
// Every effect is skipped under reduced motion; CSS keeps content visible without JS.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ease, prefersReducedMotion } from './env';

gsap.registerPlugin(ScrollTrigger, SplitText);

// When set, intro reveals jump to their end state instead of playing (back/forward arrivals:
// the visitor has seen this page, and a half-revealed hero reads as broken).
let instantIntro = false;
export const setInstantIntro = (v: boolean) => { instantIntro = v; };

// Phones: a reveal that starts at 88% of a short viewport lands after the reader got there.
// There, reveals start as soon as the element enters, travel less and finish sooner.
const compact = () => matchMedia('(max-width: 760px)').matches;

const durations = { lines: 1.2, words: 1.1, chars: 0.9 } as const;
const staggers = { lines: 0.08, words: 0.035, chars: 0.018 } as const;

// autoSplit re-splits after font load / resize. A text that already revealed must stay revealed,
// so the state lives outside onSplit.
function splitTween(el: HTMLElement, isIntro: boolean) {
  const type = (el.dataset.split || 'lines') as keyof typeof durations;
  const delay = parseFloat(el.dataset.delay || '0');
  const s = { tween: undefined as gsap.core.Tween | undefined, done: false, requested: false };
  SplitText.create(el, {
    type: type === 'lines' ? 'lines' : `lines,${type}`,
    mask: 'lines',
    autoSplit: true,
    linesClass: 'split-line',
    onSplit(self) {
      gsap.set(el, { visibility: 'visible' });
      if (s.done) return;
      const targets = type === 'lines' ? self.lines : type === 'words' ? self.words : self.chars;
      s.tween = gsap.from(targets, {
        yPercent: 110,
        // No tilt under a highlight: a rotated yellow band reads as a glitch, not a reveal.
        rotate: type === 'chars' || el.querySelector('mark') ? 0 : 2,
        duration: durations[type],
        stagger: staggers[type],
        ease: ease.out,
        delay,
        paused: isIntro && !s.requested,
        onComplete: () => { s.done = true; },
        scrollTrigger: isIntro ? undefined : { trigger: el, start: compact() ? 'top 98%' : 'top 88%', once: true },
      });
      return s.tween;
    },
  });
  return () => {
    s.requested = true;
    if (!instantIntro) return void s.tween?.play();
    s.done = true;
    s.tween?.progress(1);
  };
}

function blockTween(el: HTMLElement, paused: boolean) {
  const kind = el.dataset.reveal || 'up';
  const delay = parseFloat(el.dataset.delay || '0');
  const from: gsap.TweenVars = kind === 'fade' ? { autoAlpha: 0 } : { y: compact() ? 24 : 48, autoAlpha: 0 };
  gsap.set(el, { visibility: 'visible' });
  return gsap.fromTo(el, from, {
    y: 0,
    autoAlpha: 1,
    duration: kind === 'fade' ? 1 : compact() ? 0.9 : 1.3,
    ease: ease.out,
    delay,
    paused,
    scrollTrigger: paused ? undefined : { trigger: el, start: compact() ? 'top 98%' : 'top 90%', once: true },
  });
}

/** Wire every reveal inside `root`. Returns the intro timeline (paused) for the page entrance. */
export function initReveals(root: ParentNode = document) {
  const intro = gsap.timeline({ paused: true });
  if (prefersReducedMotion()) return intro;

  root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const isIntro = el.hasAttribute('data-intro');
    const play = splitTween(el, isIntro);
    if (isIntro) intro.add(play, 0);
  });
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const isIntro = el.hasAttribute('data-intro');
    const t = blockTween(el, isIntro);
    if (isIntro) intro.add(() => void (instantIntro ? t.progress(1) : t.play()), 0);
  });
  return intro;
}
