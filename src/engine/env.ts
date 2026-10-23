export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Shared easing vocabulary (CSS timing functions for the Web Animations API). Use these names
// everywhere; never invent per-component curves. DESIGN.md: one ease family (expo), no bounce.
// `out` and `inOut` match --ease-out and --ease-in-out in tokens.css.
export const ease = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)', // default entrance, row re-sort
  inOut: 'cubic-bezier(0.87, 0, 0.13, 1)', // curtains, page transitions
  soft: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // small UI
} as const;
