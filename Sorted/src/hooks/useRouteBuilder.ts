import { useCallback } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'
import type { Venue } from '@/types/venue'
import { buildOptimalRoute, geocodeAddress } from '@/services/routeOptimiser'
import { parseTime } from '@/utils/time'

export function useRouteBuilder() {
  const {
    date,
    pax: _pax,
    startTime,
    startLocation,
    transportMode,
    bufferMins,
    endTime,
    selectedVenueIds,
    setRouteResult,
    setCalculating,
    setError,
  } = useBookingStore()
  const { venues } = useAdminStore()

  const buildRoute = useCallback(async () => {
    // Validation
    if (!date) {
      setError('Please select a date.')
      return
    }
    if (!startTime) {
      setError('Please set a start time.')
      return
    }
    if (!startLocation || startLocation.trim().length < 5) {
      setError('Please enter a starting location (at least a hotel name).')
      return
    }
    if (selectedVenueIds.length === 0) {
      setError('Please select at least one attraction.')
      return
    }

    setCalculating(true)
    setError(null)

    try {
      const selectedVenues = selectedVenueIds
        .map((id) => venues.find((v) => v.id === id))
        .filter((v): v is Venue => v !== undefined)

      const startCoord = await geocodeAddress(startLocation)
      const result = await buildOptimalRoute(
        startCoord,
        selectedVenues,
        parseTime(startTime),
        date,
        transportMode,
        bufferMins,
        parseTime(endTime),
      )

      setRouteResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setCalculating(false)
    }
  }, [date, startTime, endTime, startLocation, transportMode, bufferMins, selectedVenueIds, venues, setRouteResult, setCalculating, setError])

  return { buildRoute }
}
