import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RouteList } from '../components/browse/RouteList';
import { StopPicker } from '../components/browse/StopPicker';
import { TimePicker } from '../components/browse/TimePicker';
import { DepartureResults } from '../components/browse/DepartureResults';
import { NotificationSheet } from '../components/browse/NotificationSheet';
import type { DepartureData } from '../components/browse/DepartureCard';
import type { GtfsRoute, GtfsStop } from '../types/gtfs';
import styles from './BrowsePage.module.css';

type Step = 'routes' | 'stops' | 'time' | 'results';

const STEP_TITLES: Record<Step, string> = {
  routes: 'Browse Routes',
  stops: 'Choose Stop',
  time: 'Travel Time',
  results: 'Departures',
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
};

export function BrowsePage() {
  const [step, setStep] = useState<Step>('routes');
  const [direction, setDirection] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState<GtfsRoute | null>(null);
  const [selectedStop, setSelectedStop] = useState<GtfsStop | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [sheetDeparture, setSheetDeparture] = useState<DepartureData | null>(null);
  const [sheetWalkingSeconds, setSheetWalkingSeconds] = useState(300);
  const [sheetWalkingText, setSheetWalkingText] = useState('~5 min walk');

  function navigate(nextStep: Step, dir: number) {
    setDirection(dir);
    setStep(nextStep);
  }

  function handleSelectRoute(route: GtfsRoute) {
    setSelectedRoute(route);
    navigate('stops', 1);
  }

  function handleSelectStop(stop: GtfsStop) {
    setSelectedStop(stop);
    navigate('time', 1);
  }

  function handleSelectTime(hour: number) {
    setSelectedHour(hour);
    navigate('results', 1);
  }

  function handleBack() {
    if (step === 'stops') navigate('routes', -1);
    else if (step === 'time') navigate('stops', -1);
    else if (step === 'results') navigate('time', -1);
  }

  function handleSelectDeparture(dep: DepartureData, walkSecs: number, walkText: string) {
    setSheetWalkingSeconds(walkSecs);
    setSheetWalkingText(walkText);
    setSheetDeparture(dep);
  }

  const showBack = step !== 'routes';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {showBack && (
            <button className={styles.backBtn} onClick={handleBack} aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          )}
        </div>
        <h1 className={styles.title}>{STEP_TITLES[step]}</h1>
        <div className={styles.headerRight}>
          {selectedRoute && step !== 'routes' && (
            <span className={styles.routeChip}>{selectedRoute.route_short_name}</span>
          )}
        </div>
      </div>

      <div className={styles.breadcrumbs}>
        {(['routes', 'stops', 'time', 'results'] as Step[]).map((s, i) => (
          <motion.div
            key={s}
            className={`${styles.dot} ${step === s ? styles.dotActive : ''} ${i < (['routes','stops','time','results'] as Step[]).indexOf(step) ? styles.dotDone : ''}`}
            animate={{ scale: step === s ? 1.3 : 1 }}
          />
        ))}
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            className={styles.stepPane}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }}
          >
            {step === 'routes' && <RouteList onSelectRoute={handleSelectRoute} />}
            {step === 'stops' && selectedRoute && <StopPicker route={selectedRoute} onSelectStop={handleSelectStop} />}
            {step === 'time' && <TimePicker onSelectTime={handleSelectTime} />}
            {step === 'results' && selectedRoute && selectedStop && selectedHour !== null && (
              <DepartureResults
                route={selectedRoute}
                stop={selectedStop}
                hour={selectedHour}
                onSelectDeparture={handleSelectDeparture}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {selectedRoute && selectedStop && (
        <NotificationSheet
          departure={sheetDeparture}
          route={selectedRoute}
          stop={selectedStop}
          walkingSeconds={sheetWalkingSeconds}
          walkingText={sheetWalkingText}
          onClose={() => setSheetDeparture(null)}
        />
      )}
    </div>
  );
}
