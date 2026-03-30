import React from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, onClick, onLongPress, className = '', noPadding }: CardProps) {
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePointerDown() {
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, 500);
    }
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }

  function handlePointerCancel() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }

  return (
    <motion.div
      className={`${styles.card} ${noPadding ? styles.noPadding : ''} ${className}`}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      layout
    >
      {children}
    </motion.div>
  );
}
