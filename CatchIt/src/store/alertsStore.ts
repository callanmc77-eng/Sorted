import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserAlert } from '../types/alert';

interface AlertsState {
  alerts: UserAlert[];
  addAlert: (alert: UserAlert) => void;
  removeAlert: (alertId: string) => void;
  toggleAlert: (alertId: string) => void;
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [],
      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
        })),
      removeAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.alertId !== alertId),
        })),
      toggleAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.alertId === alertId ? { ...a, active: !a.active } : a
          ),
        })),
    }),
    {
      name: 'catchit_alerts',
    }
  )
);
