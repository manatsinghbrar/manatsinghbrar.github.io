// Page transitions. Adapters run leave() while the next page loads, so a transition adds
// little or no latency. Override the look with setTransition() (this site: src/motion/setup.ts).
import { prefersReducedMotion } from './env';

export type Transition = {
  leave: (curtain: HTMLElement) => Promise<unknown>;
  // startIntro lets an enter start the page intro before it finishes (idempotent; the engine
  // starts it after the enter otherwise).
  enter: (curtain: HTMLElement, startIntro: () => void) => Promise<unknown>;
};

type Styles = Record<string, string>;

/** Animate `el` from `from` to `to` (Web Animations API) and keep `to` as its inline style.
 *  `fill: backwards` holds `from` through any delay. Resolves when done, or at once if cancelled. */
export function tween(el: HTMLElement, from: Styles, to: Styles, options: KeyframeAnimationOptions) {
  Object.assign(el.style, to);
  return el.animate([from, to], { fill: 'backwards', ...options }).finished.catch(() => {});
}

/** Show or hide at once (opacity and visibility together). */
export function setShown(el: HTMLElement, shown: boolean) {
  el.style.opacity = shown ? '1' : '0';
  el.style.visibility = shown ? 'visible' : 'hidden';
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Default (also the reduced-motion transition): the curtain fades in and out.
const fade: Transition = {
  async leave(c) {
    setShown(c, true);
    await tween(c, { opacity: '0' }, { opacity: '1' }, { duration: 200 });
  },
  async enter(c) {
    await tween(c, { opacity: '1' }, { opacity: '0' }, { duration: 200 });
    setShown(c, false);
  },
};

let current: Transition = fade;

export const setTransition = (t: Transition) => { current = t; };
const pick = () => (prefersReducedMotion() ? fade : current);
const curtain = () => document.getElementById('curtain') as HTMLElement;

export const playLeave = () => pick().leave(curtain());
export const playEnter = (startIntro: () => void = () => {}) => pick().enter(curtain(), startIntro);
