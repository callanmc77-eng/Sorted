import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Venue, City } from '@/types/venue'
import venuesJson from '@/data/venues.json'

interface AdminState {
  isAuthenticated: boolean
  venues: Venue[]
  cities: City[]

  login: (username: string, password: string) => boolean
  logout: () => void
  addVenue: (venue: Venue) => void
  updateVenue: (id: string, patch: Partial<Venue>) => void
  removeVenue: (id: string) => void
  addCity: (city: City) => void
  removeCity: (id: string) => void
  resetToDefaults: () => void
}

const DEFAULT_VENUES = venuesJson as Venue[]
const DEFAULT_CITIES: City[] = [
  { id: 'dublin', name: 'Dublin', defaultLat: 53.3498, defaultLng: -6.2603 },
]

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      venues: DEFAULT_VENUES,
      cities: DEFAULT_CITIES,

      login: (username, password) => {
        const ok =
          username === import.meta.env.VITE_ADMIN_USERNAME &&
          password === import.meta.env.VITE_ADMIN_PASSWORD
        if (ok) set({ isAuthenticated: true })
        return ok
      },
      logout: () => set({ isAuthenticated: false }),

      addVenue: (venue) =>
        set((state) => ({ venues: [...state.venues, venue] })),
      updateVenue: (id, patch) =>
        set((state) => ({
          venues: state.venues.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      removeVenue: (id) =>
        set((state) => ({ venues: state.venues.filter((v) => v.id !== id) })),
      addCity: (city) =>
        set((state) => ({ cities: [...state.cities, city] })),
      removeCity: (id) =>
        set((state) => ({ cities: state.cities.filter((c) => c.id !== id) })),
      resetToDefaults: () =>
        set({ venues: DEFAULT_VENUES, cities: DEFAULT_CITIES }),
    }),
    {
      name: 'sorted_admin',
      // Auth flag is NOT persisted — re-login required every session
      partialize: (state) => ({
        venues: state.venues,
        cities: state.cities,
      }),
    },
  ),
)
