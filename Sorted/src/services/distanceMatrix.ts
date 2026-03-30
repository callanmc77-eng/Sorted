import type { TransportMode } from '@/types/itinerary'

export interface DistanceMatrix {
  /** durations[i][j] = seconds from location i to location j */
  durations: number[][]
  /** distances[i][j] = metres from location i to location j */
  distances: number[][]
}

export async function fetchDistanceMatrix(
  locations: { lat: number; lng: number }[],
  mode: TransportMode,
): Promise<DistanceMatrix> {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService()
    const latLngs = locations.map((l) => new google.maps.LatLng(l.lat, l.lng))

    service.getDistanceMatrix(
      {
        origins: latLngs,
        destinations: latLngs,
        travelMode: google.maps.TravelMode[mode],
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== google.maps.DistanceMatrixStatus.OK || !response) {
          reject(new Error(`Distance Matrix API error: ${status}`))
          return
        }

        const n = locations.length
        const durations: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
        const distances: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))

        response.rows.forEach((row, i) => {
          row.elements.forEach((el, j) => {
            if (el.status === 'OK') {
              durations[i][j] = el.duration.value
              distances[i][j] = el.distance.value
            } else {
              // Fallback sentinel value (will not be chosen as nearest)
              durations[i][j] = 9_999_999
              distances[i][j] = 9_999_999
            }
          })
        })

        resolve({ durations, distances })
      },
    )
  })
}
