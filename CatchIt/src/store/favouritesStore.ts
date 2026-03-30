import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavouritesState {
  routes: string[];
  stops: string[];
  toggleRoute: (routeId: string) => void;
  toggleStop: (stopId: string) => void;
  isFavouriteRoute: (routeId: string) => boolean;
  isFavouriteStop: (stopId: string) => boolean;
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      routes: [],
      stops: [],
      toggleRoute: (routeId) =>
        set((state) => ({
          routes: state.routes.includes(routeId)
            ? state.routes.filter((id) => id !== routeId)
            : [...state.routes, routeId],
        })),
      toggleStop: (stopId) =>
        set((state) => ({
          stops: state.stops.includes(stopId)
            ? state.stops.filter((id) => id !== stopId)
            : [...state.stops, stopId],
        })),
      isFavouriteRoute: (routeId) => get().routes.includes(routeId),
      isFavouriteStop: (stopId) => get().stops.includes(stopId),
    }),
    {
      name: 'catchit_favourites',
    }
  )
);
