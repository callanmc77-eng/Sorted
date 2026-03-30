import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
