export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Shared easing vocabulary. Use these names everywhere; never invent per-component curves.
// DESIGN.md: one ease family (expo), no bounce.
export const ease = {
  out: 'expo.out', // default entrance, row re-sort
  inOut: 'expo.inOut', // curtains, page transitions
  soft: 'power3.out', // small UI
} as const;
