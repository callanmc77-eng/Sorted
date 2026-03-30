import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import styles from './SwipeToDelete.module.css';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
}

const DELETE_THRESHOLD = -80;

export function SwipeToDelete({ children, onDelete, deleteLabel = 'Delete' }: SwipeToDeleteProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [0, DELETE_THRESHOLD], [0, 1]);
  const deleteScale = useTransform(x, [0, DELETE_THRESHOLD], [0.8, 1]);

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x < DELETE_THRESHOLD) {
      animate(x, DELETE_THRESHOLD * 1.5, {
        type: 'tween',
        duration: 0.15,
        onComplete: onDelete,
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
    }
  }

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.deleteAction}
        style={{ opacity: deleteOpacity }}
      >
        <motion.div style={{ scale: deleteScale }} className={styles.deleteContent}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2" />
          </svg>
          <span>{deleteLabel}</span>
        </motion.div>
      </motion.div>
      <motion.div
        className={styles.content}
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: DELETE_THRESHOLD * 1.5, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
