import { type Variants } from "framer-motion";

export const MATERIAL_EASING = [0.2, 0, 0, 1] as const;
export const MATERIAL_DURATION = 0.3;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: MATERIAL_DURATION, ease: MATERIAL_EASING as unknown as number[] },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: MATERIAL_EASING as unknown as number[] },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: MATERIAL_EASING as unknown as number[] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: MATERIAL_EASING as unknown as number[] },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MATERIAL_DURATION, ease: MATERIAL_EASING as unknown as number[] },
  },
};

export const cardHover = {
  rest: {
    y: 0,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)",
  },
  hover: {
    y: -2,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)",
    transition: { duration: MATERIAL_DURATION, ease: MATERIAL_EASING as unknown as number[] },
  },
};

export const tapScale = {
  whileTap: { scale: 0.95 },
  transition: { duration: 0.1, ease: MATERIAL_EASING as unknown as number[] },
};
