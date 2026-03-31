import { useEffect, useRef } from 'react'
import type { RouteResult, ScheduledStop } from '@/types/itinerary'

interface Props {
  result: RouteResult
  isLoaded: boolean
}

const NAVY = '#0f1729'

export function RouteMap({ result, isLoaded }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polylineRef = useRef<google.maps.Polyline | null>(null)

  // Initialise map once
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 53.3454, lng: -6.2672 }, // Dublin centre
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      gestureHandling: 'cooperative',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dde9f5' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f8f9fb' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
        { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#4a6a9e' }] },
      ],
    })
  }, [isLoaded])

  // Update markers and polyline whenever result changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    // Clear previous markers and polyline
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []
    polylineRef.current?.setMap(null)

    const feasibleStops = result.stops.filter(
      (s): s is ScheduledStop => s.feasible && !('isLunch' in s),
    )

    if (feasibleStops.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    const path: google.maps.LatLngLiteral[] = []

    feasibleStops.forEach((stop, i) => {
      const pos = stop.venue.coordinates
      bounds.extend(pos)
      path.push(pos)

      // Numbered marker using SVG label
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current!,
        label: {
          text: String(i + 1),
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 'bold',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: NAVY,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: stop.venue.name,
        zIndex: 10,
      })
      markersRef.current.push(marker)
    })

    // Dashed polyline connecting stops in order
    polylineRef.current = new google.maps.Polyline({
      path,
      map: mapInstanceRef.current,
      strokeColor: NAVY,
      strokeOpacity: 0,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.5, scale: 3 },
        offset: '0',
        repeat: '12px',
      }],
    })

    mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })
  }, [result, isLoaded])

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: 0 }}
    />
  )
}
