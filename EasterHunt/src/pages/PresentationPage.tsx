import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchPresentationData, buildDemoData } from '../services/presentationData';
import type { PresentationData } from '../services/presentationData';
import { PUBS } from '../constants/pubs';
import IntroSlide from '../components/presentation/IntroSlide';
import StopHeaderSlide from '../components/presentation/StopHeaderSlide';
import PhotoSlide from '../components/presentation/PhotoSlide';
import PodiumSlide from '../components/presentation/PodiumSlide';
import styles from './PresentationPage.module.css';

// ── Slide descriptors ──────────────────────────────────────────────────────────
type Slide =
  | { type: 'intro' }
  | { type: 'stop-header'; pubIndex: number }
  | { type: 'photo'; pubIndex: number; teamIdx: number }
  | { type: 'podium' };

function buildSlides(data: PresentationData): Slide[] {
  const slides: Slide[] = [{ type: 'intro' }];

  PUBS.forEach((pub) => {
    slides.push({ type: 'stop-header', pubIndex: pub.index });
    data.teams.forEach((_, teamIdx) => {
      slides.push({ type: 'photo', pubIndex: pub.index, teamIdx });
    });
  });

  slides.push({ type: 'podium' });
  return slides;
}

// ── Image preloading ──────────────────────────────────────────────────────────
function preloadImages(
  data: PresentationData,
  onProgress: (pct: number) => void
): Promise<void> {
  const urls: string[] = [];
  data.teams.forEach((t) => {
    Object.values(t.checkins).forEach((url) => urls.push(url));
    const avatarUrl = t.checkins[0];
    if (avatarUrl) urls.push(avatarUrl);
  });

  if (urls.length === 0) { onProgress(100); return Promise.resolve(); }

  let loaded = 0;
  return new Promise((resolve) => {
    urls.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        onProgress(Math.round((loaded / urls.length) * 100));
        if (loaded === urls.length) resolve();
      };
      img.src = url;
    });
  });
}

// ── Slide renderer ─────────────────────────────────────────────────────────────
function renderSlide(slide: Slide, data: PresentationData) {
  if (slide.type === 'intro') return <IntroSlide />;

  if (slide.type === 'stop-header') {
    const checkedIn = data.teams.filter((t) => t.checkins[slide.pubIndex]).length;
    return (
      <StopHeaderSlide
        pubIndex={slide.pubIndex}
        pubName={data.pubNames[slide.pubIndex]}
        totalTeams={checkedIn}
      />
    );
  }

  if (slide.type === 'photo') {
    const entry = data.teams[slide.teamIdx];
    const photoUrl = entry.checkins[slide.pubIndex] ?? null;
    return (
      <PhotoSlide
        teamName={entry.team.name}
        rank={entry.rank}
        photoUrl={photoUrl}
        pubName={data.pubNames[slide.pubIndex]}
        pubIndex={slide.pubIndex}
      />
    );
  }

  if (slide.type === 'podium') return <PodiumSlide teams={data.teams} />;

  return null;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PresentationPage() {
  const [params] = useSearchParams();
  const isDemo = params.get('demo') === 'true';

  const [data, setData] = useState<PresentationData | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  // Load data + preload images
  useEffect(() => {
    (async () => {
      try {
        const raw = isDemo ? buildDemoData() : await fetchPresentationData();
        setData(raw);
        await preloadImages(raw, setLoadPct);
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      }
    })();
  }, [isDemo]);

  const slides = data ? buildSlides(data) : [];

  const go = useCallback((delta: number) => {
    setDirection(delta);
    setSlideIdx((i) => Math.max(0, Math.min(slides.length - 1, i + delta)));
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')                    { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  // Click navigation (click right half = next, left half = prev)
  const handleClick = (e: React.MouseEvent) => {
    if (!ready) return;
    go(e.clientX > window.innerWidth / 2 ? 1 : -1);
  };

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{error}</span>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <span className={styles.loadingEmoji}>🍺</span>
          <span className={styles.loadingTitle}>Loading the trail…</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${loadPct}%` }} />
          </div>
          <span className={styles.loadingStatus}>
            {loadPct < 100 ? `Fetching photos… ${loadPct}%` : 'Almost ready'}
          </span>
        </div>
      </div>
    );
  }

  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.97 }),
  };

  const MAX_DOTS = 20;
  const showDots = slides.length <= MAX_DOTS;

  return (
    <div className={styles.page} onClick={handleClick}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slideIdx}
          className={styles.slideWrap}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          {renderSlide(slides[slideIdx], data!)}
        </motion.div>
      </AnimatePresence>

      {/* Nav hints */}
      {slideIdx > 0 && (
        <span className={`${styles.navHint} ${styles.navHintLeft}`}>← Prev</span>
      )}
      {slideIdx < slides.length - 1 && (
        <span className={`${styles.navHint} ${styles.navHintRight}`}>Next →</span>
      )}

      {/* Progress dots */}
      {showDots && (
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === slideIdx ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
