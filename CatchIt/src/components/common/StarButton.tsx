import { motion } from 'framer-motion';
import styles from './StarButton.module.css';

interface StarButtonProps {
  active: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

export function StarButton({ active, onToggle }: StarButtonProps) {
  return (
    <motion.button
      className={`${styles.star} ${active ? styles.active : ''}`}
      onClick={onToggle}
      whileTap={{ scale: 0.8 }}
      aria-label={active ? 'Remove from favourites' : 'Add to favourites'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    </motion.button>
  );
}
