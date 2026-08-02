"use client";

import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Shared easing/duration so every entrance on the page feels like one system.
 * Subtle: short travel, no overshoot, no bounce.
 */
const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];
const DURATION = 0.55;

const VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" };

type MotionDivProps = React.ComponentProps<typeof motion.div>;

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
};

export interface RevealProps extends MotionDivProps {
  /** Seconds to wait before this element animates in. */
  delay?: number;
  /** Direction the element travels as it settles into place. */
  direction?: Direction;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
}

/** Fade + slide an element in the first time it enters the viewport. */
export function Reveal({
  className,
  delay = 0,
  direction = "up",
  immediate = false,
  children,
  ...props
}: RevealProps) {
  const offset = offsets[direction];

  const trigger: MotionDivProps = immediate
    ? { animate: { opacity: 1, x: 0, y: 0 } }
    : { whileInView: { opacity: 1, x: 0, y: 0 }, viewport: VIEWPORT };

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      transition={{ duration: DURATION, delay, ease: EASE }}
      {...trigger}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
};

export interface RevealGroupProps extends MotionDivProps {
  /** Seconds between each child's entrance. */
  stagger?: number;
}

/**
 * Parent for `RevealItem` children — cascades their entrance instead of
 * animating every card at the exact same moment.
 */
export function RevealGroup({
  className,
  stagger = 0.08,
  children,
  ...props
}: RevealGroupProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={groupVariants}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

/** A single staggered child of `RevealGroup`. */
export function RevealItem({ className, children, ...props }: MotionDivProps) {
  return (
    <motion.div className={cn(className)} variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}
