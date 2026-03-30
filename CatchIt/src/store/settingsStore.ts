import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultBufferMinutes: number;
  setDefaultBufferMinutes: (minutes: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultBufferMinutes: 5,
      setDefaultBufferMinutes: (minutes) => set({ defaultBufferMinutes: minutes }),
    }),
    { name: 'catchit_settings' }
  )
);
