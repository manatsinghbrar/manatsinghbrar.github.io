// Native scroll only (no smooth-scroll library).

export const resetScroll = () => scrollTo(0, 0);
export function scrollToTarget(target: string | HTMLElement | number) {
  if (typeof target === 'number') scrollTo({ top: target });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView();
}
