import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@mui/material';

// Apple-inspired easing curves
export const appleEasing = {
  ease: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  smooth: { type: 'spring', stiffness: 400, damping: 40 },
  gentle: { type: 'spring', stiffness: 200, damping: 25 },
};

// Fade in animation (Apple-style)
export const FadeIn = ({ children, delay = 0, duration = 0.6, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{
      duration,
      delay,
      ease: appleEasing.ease,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide in from bottom (like iOS sheets)
export const SlideInFromBottom = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 100 }}
    transition={{
      ...appleEasing.spring,
      delay,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Scale in animation (like iOS app icons)
export const ScaleIn = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{
      ...appleEasing.spring,
      delay,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Staggered children animation
export const StaggerContainer = ({ children, staggerDelay = 0.1, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, ...props }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          ...appleEasing.spring,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Hover animation wrapper
export const HoverScale = ({ children, scale = 1.02, ...props }) => (
  <motion.div
    whileHover={{ 
      scale,
      transition: { ...appleEasing.smooth }
    }}
    whileTap={{ 
      scale: 0.98,
      transition: { ...appleEasing.smooth }
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Floating animation (like Apple's hero elements)
export const FloatingElement = ({ children, ...props }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Page transition wrapper
export const PageTransition = ({ children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{
      duration: 0.4,
      ease: appleEasing.ease,
    }}
    style={{ width: '100%' }}
    {...props}
  >
    {children}
  </motion.div>
);

// Card hover animation
export const InteractiveCard = ({ children, ...props }) => (
  <motion.div
    whileHover={{
      y: -4,
      transition: { ...appleEasing.smooth }
    }}
    whileTap={{
      scale: 0.98,
      transition: { ...appleEasing.smooth }
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Smooth reveal animation
export const RevealOnScroll = ({ children, threshold = 0.1, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: threshold }}
    transition={{
      duration: 0.6,
      ease: appleEasing.ease,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Loading spinner (Apple-style)
export const AppleSpinner = ({ size = 24, color = '#007AFF' }) => (
  <motion.div
    style={{
      width: size,
      height: size,
      border: `2px solid transparent`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
    }}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

// Pulse animation for notifications
export const PulseAnimation = ({ children, ...props }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Smooth modal/dialog animation
export const ModalAnimation = ({ children, isOpen, ...props }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{
          ...appleEasing.spring,
          duration: 0.3,
        }}
        {...props}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Backdrop animation
export const BackdropAnimation = ({ children, isOpen, ...props }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 1000,
        }}
        {...props}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Typewriter animation for text
export const TypewriterText = ({ text, delay = 0, speed = 0.05 }) => {
  const [displayText, setDisplayText] = React.useState('');

  React.useEffect(() => {
    let timeoutId;
    let currentIndex = 0;

    const typeText = () => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
        timeoutId = setTimeout(typeText, speed * 1000);
      }
    };

    const startTyping = setTimeout(typeText, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(startTyping);
    };
  }, [text, delay, speed]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        |
      </motion.span>
    </motion.span>
  );
};

// Smooth list animation
export const AnimatedList = ({ children, ...props }) => (
  <StaggerContainer staggerDelay={0.1} {...props}>
    {React.Children.map(children, (child, index) => (
      <StaggerItem key={index}>
        {child}
      </StaggerItem>
    ))}
  </StaggerContainer>
);

// Glass morphism container
export const GlassMorphism = ({ children, ...props }) => (
  <Box
    sx={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

export default {
  FadeIn,
  SlideInFromBottom,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  FloatingElement,
  PageTransition,
  InteractiveCard,
  RevealOnScroll,
  AppleSpinner,
  PulseAnimation,
  ModalAnimation,
  BackdropAnimation,
  TypewriterText,
  AnimatedList,
  GlassMorphism,
}; 