// Native scroll only (no smooth-scroll library). ScrollTrigger reads native scroll on its own.

export const resetScroll = () => scrollTo(0, 0);
export function scrollToTarget(target: string | HTMLElement | number) {
  if (typeof target === 'number') scrollTo({ top: target });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView();
}
