// Page transitions. Adapters run leave() while the next page loads, so a transition adds
// little or no latency. Override the look with setTransition() (this site: src/motion/setup.ts).
import { gsap } from 'gsap';
import { ease, prefersReducedMotion } from './env';

export type Transition = {
  leave: (curtain: HTMLElement) => Promise<unknown> | gsap.core.Animation;
  // startIntro lets an enter start the page intro before it finishes (idempotent; the engine
  // starts it after the enter otherwise).
  enter: (curtain: HTMLElement, startIntro: () => void) => Promise<unknown> | gsap.core.Animation;
};

// Default: the ink rows cover the page at once, then lift off the new one.
let current: Transition = {
  leave: (c) => gsap.timeline()
    .set(c, { autoAlpha: 1 })
    .fromTo(c.querySelector('.curtain__rows'), { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: ease.inOut }),
  enter: (c) => gsap.timeline()
    .to(c.querySelector('.curtain__rows'), { yPercent: -100, duration: 0.9, ease: ease.inOut })
    .set(c, { autoAlpha: 0 }),
};

const reduced: Transition = {
  leave: (c) => gsap.timeline().set(c, { autoAlpha: 1 }).fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.2 }),
  enter: (c) => gsap.to(c, { autoAlpha: 0, duration: 0.2 }),
};

export const setTransition = (t: Transition) => { current = t; };
const pick = () => (prefersReducedMotion() ? reduced : current);
const curtain = () => document.getElementById('curtain') as HTMLElement;

export const playLeave = () => Promise.resolve(pick().leave(curtain()));
export const playEnter = (startIntro: () => void = () => {}) => Promise.resolve(pick().enter(curtain(), startIntro));
