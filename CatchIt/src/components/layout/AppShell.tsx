import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomTabBar } from './BottomTabBar';
import { useGeolocation } from '../../hooks/useGeolocation';
import styles from './AppShell.module.css';

const LOCATION_ASKED_KEY = 'catchit_location_asked';

export function AppShell() {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { permissionState, requestLocation } = useGeolocation();

  useEffect(() => {
    const asked = localStorage.getItem(LOCATION_ASKED_KEY);
    if (!asked && permissionState === 'prompt') {
      setShowLocationModal(true);
    }
  }, [permissionState]);

  function handleAllow() {
    localStorage.setItem(LOCATION_ASKED_KEY, 'true');
    setShowLocationModal(false);
    requestLocation();
  }

  function handleDeny() {
    localStorage.setItem(LOCATION_ASKED_KEY, 'true');
    setShowLocationModal(false);
  }

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomTabBar />

      <AnimatePresence>
        {showLocationModal && (
          <>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDeny}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className={styles.modalIcon}>📍</div>
              <h2 className={styles.modalTitle}>Your location</h2>
              <p className={styles.modalText}>
                Catch It uses your location to calculate how long it'll take you to walk to your chosen bus stop — so you know exactly when to leave.
              </p>
              <button className={styles.primaryBtn} onClick={handleAllow}>
                Allow location access
              </button>
              <button className={styles.ghostBtn} onClick={handleDeny}>
                Not now
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
