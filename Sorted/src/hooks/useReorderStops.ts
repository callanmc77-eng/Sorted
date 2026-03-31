import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'
import { scheduleVenues } from '@/services/routeOptimiser'
import type { RouteResult } from '@/types/itinerary'

export function useReorderStops() {
  const { routeResult, setRouteResult } = useBookingStore()
  const { venues } = useAdminStore()

  function reorder(fromIndex: number, toIndex: number) {
    if (!routeResult || fromIndex === toIndex) return

    const newOrder = [...routeResult.venueOrder]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)

    // Rebuild travelBetween for the new order
    // We have the full NxN matrix stored as travelBetween[i][j] = old_i → old_j
    // Map new indices back to old to get correct travel times
    const oldOrder = routeResult.venueOrder
    const newTravelFromStart = newOrder.map((id) => {
      const oldIdx = oldOrder.indexOf(id)
      return routeResult.travelFromStart[oldIdx]
    })
    const newTravelBetween = newOrder.map((fromId) => {
      const oldFromIdx = oldOrder.indexOf(fromId)
      return newOrder.map((toId) => {
        const oldToIdx = oldOrder.indexOf(toId)
        return routeResult.travelBetween[oldFromIdx][oldToIdx]
      })
    })

    const orderedVenues = newOrder
      .map((id) => venues.find((v) => v.id === id))
      .filter((v): v is NonNullable<typeof v> => v != null)

    const scheduled = scheduleVenues(
      orderedVenues,
      newTravelFromStart,
      newTravelBetween,
      routeResult.startTimeMins,
      routeResult.dateStr,
      routeResult.bufferMins,
      routeResult.endTimeMins,
      routeResult.includeLunch,
      routeResult.lunchDurationMins,
      routeResult.lunchAfterStop,
    )

    const newResult: RouteResult = {
      ...scheduled,
      venueOrder: newOrder,
      travelFromStart: newTravelFromStart,
      travelBetween: newTravelBetween,
      startTimeMins: routeResult.startTimeMins,
      dateStr: routeResult.dateStr,
      bufferMins: routeResult.bufferMins,
      endTimeMins: routeResult.endTimeMins,
      includeLunch: routeResult.includeLunch,
      lunchDurationMins: routeResult.lunchDurationMins,
      lunchAfterStop: routeResult.lunchAfterStop,
    }

    setRouteResult(newResult)
  }

  return { reorder }
}
