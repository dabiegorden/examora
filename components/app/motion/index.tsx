"use client";

import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Animation wrappers.
 *
 * One easing curve and one duration for the whole application, so nothing feels
 * like it came from a different product. Every animation here is short, travels
 * a small distance, and never overshoots.
 *
 * `MotionConfig reducedMotion="user"` is already applied at the root
 * (`components/providers.tsx`), so all of these honour
 * `prefers-reduced-motion` without opting in individually.
 */

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];
const DURATION = 0.4;

type MotionDivProps = React.ComponentProps<typeof motion.div>;

export interface EntranceProps extends MotionDivProps {
  /** Seconds to wait before animating. */
  delay?: number;
  /** Animate when scrolled into view rather than on mount. */
  whenInView?: boolean;
}

const viewport = { once: true, amount: 0.2, margin: "0px 0px -60px 0px" };

function entrance(
  from: Record<string, number>,
  { delay = 0, whenInView = false, className, children, ...props }: EntranceProps
) {
  const to = Object.fromEntries(Object.keys(from).map((key) => [key, key === "opacity" ? 1 : key === "scale" ? 1 : 0]));

  return (
    <motion.div
      className={cn(className)}
      initial={from}
      transition={{ duration: DURATION, delay, ease: EASE }}
      {...(whenInView
        ? { whileInView: to, viewport }
        : { animate: to })}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn(props: EntranceProps) {
  return entrance({ opacity: 0 }, props);
}

export function SlideUp(props: EntranceProps) {
  return entrance({ opacity: 0, y: 16 }, props);
}

export function ScaleIn(props: EntranceProps) {
  return entrance({ opacity: 0, scale: 0.97 }, props);
}

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.04 },
  }),
};

export interface StaggerContainerProps extends MotionDivProps {
  /** Seconds between each child's entrance. */
  stagger?: number;
  whenInView?: boolean;
}

/** Cascades the entrance of its `StaggerItem` children. */
export function StaggerContainer({
  stagger = 0.06,
  whenInView = false,
  className,
  children,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      custom={stagger}
      initial="hidden"
      {...(whenInView ? { whileInView: "visible", viewport } : { animate: "visible" })}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

export function StaggerItem({ className, children, ...props }: MotionDivProps) {
  return (
    <motion.div className={cn(className)} variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Lift-on-hover wrapper.
 *
 * Named `HoverLift` rather than `HoverCard` because `components/ui/hover-card`
 * already exists and is a popover primitive — two different things sharing a
 * name would be a permanent source of wrong imports.
 */
export function HoverLift({ className, children, ...props }: MotionDivProps) {
  return (
    <motion.div
      className={cn(className)}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.18, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** A page section that fades up as it scrolls into view. */
export function AnimatedSection({ className, children, ...props }: EntranceProps) {
  return (
    <SlideUp whenInView className={cn(className)} {...props}>
      {children}
    </SlideUp>
  );
}
