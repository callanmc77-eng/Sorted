import { create } from 'zustand'
import type { BookingInputs, RouteResult, TransportMode, TourDuration } from '@/types/itinerary'
import { TOUR_END_TIMES } from '@/types/itinerary'

interface BookingState extends BookingInputs {
  bufferMins: number
  tourDuration: TourDuration
  endTime: string            // "HH:MM" — the cap time for the tour
  routeResult: RouteResult | null
  isCalculating: boolean
  error: string | null

  setCity: (cityId: string) => void
  setDate: (date: string) => void
  setPax: (pax: number) => void
  setStartTime: (time: string) => void
  setStartLocation: (location: string) => void
  setTransportMode: (mode: TransportMode) => void
  setBufferMins: (mins: number) => void
  setTourDuration: (duration: TourDuration) => void
  setEndTime: (time: string) => void
  toggleVenue: (venueId: string) => void
  setRouteResult: (result: RouteResult | null) => void
  setCalculating: (v: boolean) => void
  setError: (e: string | null) => void
}

export const useBookingStore = create<BookingState>()((set) => ({
  cityId: 'dublin',
  date: '',
  pax: 2,
  startTime: '09:00',
  startLocation: '',
  transportMode: 'DRIVING',
  selectedVenueIds: [],
  bufferMins: 0,
  tourDuration: 'full',
  endTime: TOUR_END_TIMES.full,
  routeResult: null,
  isCalculating: false,
  error: null,

  setCity: (cityId) => set({ cityId }),
  setDate: (date) => set({ date, routeResult: null }),
  setPax: (pax) => set({ pax }),
  setStartTime: (startTime) => set({ startTime, routeResult: null }),
  setStartLocation: (startLocation) => set({ startLocation, routeResult: null }),
  setTransportMode: (transportMode) => set({ transportMode, routeResult: null }),
  setBufferMins: (bufferMins) => set({ bufferMins, routeResult: null }),
  setTourDuration: (tourDuration) =>
    set({
      tourDuration,
      endTime: tourDuration !== 'custom' ? TOUR_END_TIMES[tourDuration] : TOUR_END_TIMES.full,
      routeResult: null,
    }),
  setEndTime: (endTime) => set({ endTime, tourDuration: 'custom', routeResult: null }),
  toggleVenue: (venueId) =>
    set((state) => ({
      selectedVenueIds: state.selectedVenueIds.includes(venueId)
        ? state.selectedVenueIds.filter((id) => id !== venueId)
        : [...state.selectedVenueIds, venueId],
      routeResult: null,
    })),
  setRouteResult: (routeResult) => set({ routeResult }),
  setCalculating: (isCalculating) => set({ isCalculating }),
  setError: (error) => set({ error }),
}))
