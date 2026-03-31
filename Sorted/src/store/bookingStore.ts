import { create } from 'zustand'
import type { BookingInputs, RouteResult, TransportMode, TourDuration } from '@/types/itinerary'
import { TOUR_END_TIMES } from '@/types/itinerary'

interface BookingState extends BookingInputs {
  bufferMins: number
  tourDuration: TourDuration
  endTime: string
  includeLunch: boolean
  lunchDurationMins: number
  lunchAfterStop: number | null   // 1-based stop index, null = not set
  pinnedLastId: string | null     // venue id to always place last
  routeResult: RouteResult | null
  isCalculating: boolean
  error: string | null

  setCity: (cityId: string) => void
  setDate: (date: string) => void
  setAdults: (n: number) => void
  setChildren: (n: number) => void
  setStartTime: (time: string) => void
  setStartLocation: (location: string) => void
  setTransportMode: (mode: TransportMode) => void
  setBufferMins: (mins: number) => void
  setTourDuration: (duration: TourDuration) => void
  setEndTime: (time: string) => void
  setIncludeLunch: (v: boolean) => void
  setLunchDurationMins: (mins: number) => void
  setLunchAfterStop: (stop: number | null) => void
  setPinnedLastId: (id: string | null) => void
  toggleVenue: (venueId: string) => void
  setRouteResult: (result: RouteResult | null) => void
  setCalculating: (v: boolean) => void
  setError: (e: string | null) => void
}

export const useBookingStore = create<BookingState>()((set) => ({
  cityId: 'dublin',
  date: '',
  adults: 2,
  children: 0,
  startTime: '10:00',
  startLocation: '',
  transportMode: 'DRIVING',
  selectedVenueIds: [],
  bufferMins: 0,
  tourDuration: 'full',
  endTime: TOUR_END_TIMES.full,
  includeLunch: false,
  lunchDurationMins: 60,
  lunchAfterStop: null,
  pinnedLastId: null,
  routeResult: null,
  isCalculating: false,
  error: null,

  setCity: (cityId) => set({ cityId }),
  setDate: (date) => set({ date, routeResult: null }),
  setAdults: (adults) => set({ adults }),
  setChildren: (children) => set({ children }),
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
  setIncludeLunch: (includeLunch) => set({ includeLunch, routeResult: null }),
  setLunchDurationMins: (lunchDurationMins) => set({ lunchDurationMins, routeResult: null }),
  setLunchAfterStop: (lunchAfterStop) => set({ lunchAfterStop, routeResult: null }),
  setPinnedLastId: (pinnedLastId) => set({ pinnedLastId, routeResult: null }),
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
