"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 60 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 60 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const slideInFromBottom: Variants = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
};

export const slideInFromTop: Variants = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const cardHover: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export const buttonTap: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
};

// Transition presets
export const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0.0, 0.2, 1] as const,
};

export const bounceTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 10,
};

// Reusable motion components
interface MotionWrapperProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
  duration?: number;
}

export const FadeInUp = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInUp}
    transition={{ ...smoothTransition, delay, duration }}
  >
    {children}
  </motion.div>
);

export const FadeInDown = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInDown}
    transition={{ ...smoothTransition, delay, duration }}
  >
    {children}
  </motion.div>
);

export const FadeInLeft = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInLeft}
    transition={{ ...smoothTransition, delay, duration }}
  >
    {children}
  </motion.div>
);

export const FadeInRight = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInRight}
    transition={{ ...smoothTransition, delay, duration }}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
}: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={scaleIn}
    transition={{ ...springTransition, delay }}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    variants={staggerContainer}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    variants={staggerItem}
    transition={smoothTransition}
  >
    {children}
  </motion.div>
);

// Interactive motion components
export const HoverCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    variants={cardHover}
    initial="initial"
    whileHover="hover"
  >
    {children}
  </motion.div>
);

export const TapButton = ({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <motion.button
    className={className}
    variants={buttonTap}
    initial="initial"
    whileHover="hover"
    whileTap="tap"
    onClick={onClick}
  >
    {children}
  </motion.button>
);

// Page transition wrapper
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={smoothTransition}
  >
    {children}
  </motion.div>
);

// Scroll-triggered animation hook
import { useEffect, useRef } from "react";
import { useInView, useAnimation } from "framer-motion";

export const useScrollAnimation = (threshold = 0.1) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });

  useEffect(() => {
    if (inView) {
      controls.start("animate");
    }
  }, [controls, inView]);

  return { ref, controls };
};

// Scroll reveal component
export const ScrollReveal = ({
  children,
  className = "",
  variants = fadeInUp,
  threshold = 0.1,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  threshold?: number;
  delay?: number;
}) => {
  const { ref, controls } = useScrollAnimation(threshold);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      animate={controls}
      variants={variants}
      transition={{ ...smoothTransition, delay }}
    >
      {children}
    </motion.div>
  );
};

// Loading skeleton with shimmer effect
export const ShimmerSkeleton = ({
  className = "h-4 w-full bg-gray-200 rounded",
}: {
  className?: string;
}) => (
  <div className={`relative overflow-hidden ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
      animate={{
        x: ["0%", "200%"],
      }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: "linear",
      }}
    />
  </div>
);

// Floating action button with magnetic effect
export const MagneticButton = ({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <motion.button
    className={className}
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      y: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
    }}
  >
    {children}
  </motion.button>
);

export { motion, AnimatePresence };

