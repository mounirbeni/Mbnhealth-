import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion primitives for Framer Motion.
 * Mirrors the --ease-out/--ease-in-out and --duration-* CSS variables in
 * globals.css (Framer Motion animates via JS and can't read CSS vars), and
 * the fade-in-up/scale-in Tailwind keyframes, so CSS-driven and JS-driven
 * animation look identical across the app.
 */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const DURATION = {
  fast: 0.12,
  base: 0.2,
  slow: 0.32,
} as const;

export const transitionBase: Transition = { duration: DURATION.base, ease: EASE_OUT };
export const transitionSlow: Transition = { duration: DURATION.slow, ease: EASE_OUT };

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitionSlow },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: transitionBase },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};
