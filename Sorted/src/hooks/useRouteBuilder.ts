import { useCallback } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'
import type { Venue } from '@/types/venue'
import { buildOptimalRoute, geocodeAddress } from '@/services/routeOptimiser'
import { parseTime } from '@/utils/time'

const GEOCODE_TIMEOUT_MS = 10_000

export function useRouteBuilder(isLoaded: boolean) {
  const {
    date,
    startTime,
    startLocation,
    transportMode,
    bufferMins,
    endTime,
    includeLunch,
    lunchDurationMins,
    selectedVenueIds,
    setRouteResult,
    setCalculating,
    setError,
  } = useBookingStore()
  const { venues } = useAdminStore()

  const buildRoute = useCallback(async () => {
    if (!isLoaded) {
      setError('Google Maps is still loading. Please wait a moment and try again.')
      return
    }
    if (!date) { setError('Please select a date.'); return }
    if (!startTime) { setError('Please set a start time.'); return }
    if (!startLocation || startLocation.trim().length < 3) {
      setError('Please enter a starting location.')
      return
    }
    if (selectedVenueIds.length === 0) {
      setError('Please select at least one attraction.')
      return
    }

    setCalculating(true)
    setError(null)

    // Timeout wrapper so a hung geocode call never leaves the button stuck
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out. Check your internet connection and API key.')), ms)
        ),
      ])

    try {
      const selectedVenues = selectedVenueIds
        .map((id) => venues.find((v) => v.id === id))
        .filter((v): v is Venue => v !== undefined)

      const startCoord = await withTimeout(geocodeAddress(startLocation), GEOCODE_TIMEOUT_MS)
      const result = await withTimeout(
        buildOptimalRoute(
          startCoord,
          selectedVenues,
          parseTime(startTime),
          date,
          transportMode,
          bufferMins,
          parseTime(endTime),
          includeLunch,
          lunchDurationMins,
        ),
        30_000,
      )

      setRouteResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setCalculating(false)
    }
  }, [isLoaded, date, startTime, endTime, startLocation, transportMode, bufferMins, includeLunch, lunchDurationMins, selectedVenueIds, venues, setRouteResult, setCalculating, setError])

  return { buildRoute }
}
