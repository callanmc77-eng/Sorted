import { motion } from 'framer-motion';
import styles from './IntroSlide.module.css';

export default function IntroSlide() {
  return (
    <div className={styles.slide}>
      <div className={styles.starsTop}>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>

      <motion.div
        className={styles.emojis}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <span>☀️</span><span>🍺</span><span>🌊</span>
      </motion.div>

      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
      >
        The <span className={styles.highlight}>Galway</span> Trail
      </motion.h1>

      <motion.div
        className={styles.divider}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      />

      <motion.p
        className={styles.subtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
      >
        SAP Interns · Galway · Summer 2026
      </motion.p>

      <motion.p
        className={styles.prompt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        Press → to begin
      </motion.p>

      <div className={styles.starsBot}>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
    </div>
  );
}
