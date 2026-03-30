import { useCountdown } from '../../hooks/useCountdown';
import styles from './CountdownBadge.module.css';

interface CountdownBadgeProps {
  targetMs: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownBadge({ targetMs, size = 'md' }: CountdownBadgeProps) {
  const { label, expired } = useCountdown(targetMs);
  return (
    <span className={`${styles.badge} ${styles[size]} ${expired ? styles.expired : ''}`}>
      {label}
    </span>
  );
}
