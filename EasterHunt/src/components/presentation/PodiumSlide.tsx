import { motion } from 'framer-motion';
import type { TeamCheckins } from '../../services/presentationData';
import { adjustedFinishMs } from '../../hooks/useLeaderboard';
import styles from './PodiumSlide.module.css';

interface Props {
  teams: TeamCheckins[];
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const BLOCK_CLASSES = [styles.block1, styles.block2, styles.block3];
// Podium order: 2nd left, 1st centre, 3rd right
const PODIUM_ORDER = [1, 0, 2];

export default function PodiumSlide({ teams }: Props) {
  const top3 = teams.slice(0, 3);
  const rest = teams.slice(3);

  return (
    <div className={styles.slide}>
      {/* Header */}
      <div className={styles.header}>
        <motion.span
          className={styles.crown}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
        >
          🏆
        </motion.span>
        <motion.h2
          className={styles.headerTitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Final Standings
        </motion.h2>
        <motion.p
          className={styles.headerSub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          The Galway Trail · Summer 2026
        </motion.p>
      </div>

      {/* Podium */}
      <div className={styles.podiumArea}>
        {PODIUM_ORDER.map((teamIdx, slotIdx) => {
          const entry = top3[teamIdx];
          if (!entry) return <div key={slotIdx} style={{ flex: 1 }} />;
          const displayRank = teamIdx + 1;
          const avatarUrl = entry.checkins[0] ?? null;
          const finishMs = entry.team.finished_at
            ? adjustedFinishMs(entry.team, entry.team.started_at)
            : null;

          return (
            <motion.div
              key={entry.team.id}
              className={styles.podiumSlot}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + slotIdx * 0.15, duration: 0.6, ease: 'easeOut' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={entry.team.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>🍺</div>
              )}

              <span className={styles.medal}>{MEDALS[teamIdx]}</span>
              <span className={styles.podiumTeamName}>{entry.team.name}</span>
              {finishMs !== null && (
                <span className={styles.podiumFinishTime}>{formatDuration(finishMs)}</span>
              )}

              <motion.div
                className={`${styles.block} ${BLOCK_CLASSES[teamIdx]}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ transformOrigin: 'bottom' }}
                transition={{ delay: 0.6 + slotIdx * 0.12, duration: 0.55, ease: 'easeOut' }}
              >
                <span className={styles.blockRank}>{displayRank}</span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of teams */}
      {rest.length > 0 && (
        <div className={styles.restList}>
          {rest.map((entry, i) => {
            const finishMs = entry.team.finished_at
              ? adjustedFinishMs(entry.team, entry.team.started_at)
              : null;
            return (
              <motion.div
                key={entry.team.id}
                className={styles.restRow}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.08, duration: 0.4 }}
              >
                <span className={styles.restRank}>{entry.rank}</span>
                <span className={styles.restName}>{entry.team.name}</span>
                {finishMs !== null && (
                  <span className={styles.restTime}>{formatDuration(finishMs)}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
