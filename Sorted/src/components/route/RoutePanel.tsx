import { useRef, useState } from 'react'
import type { RouteResult, ScheduledStop, RouteStop } from '@/types/itinerary'
import { RouteStep, LunchStepCard } from './RouteStep'
import { FeasibilityBanner } from './FeasibilityBanner'
import { useBookingStore } from '@/store/bookingStore'
import { useReorderStops } from '@/hooks/useReorderStops'

interface Props {
  result: RouteResult
}

// Separate out venue stops (excluding lunch) for drag indexing
function getVenueStops(stops: RouteStop[]): (ScheduledStop | Extract<RouteStop, { feasible: false }>)[] {
  return stops.filter((s): s is ScheduledStop | Extract<RouteStop, { feasible: false }> => !('isLunch' in s))
}

export function RoutePanel({ result }: Props) {
  const { startTime, adults, children } = useBookingStore()
  const { reorder } = useReorderStops()

  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const feasibleVenueStops = result.stops.filter(
    (s): s is ScheduledStop => s.feasible && !('isLunch' in s),
  )
  const infeasibleCount = result.stops.filter((s) => !s.feasible).length
  const totalMins = result.totalDurationMins
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  const durationLabel = hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : `${mins}m`

  const guestLabel = [
    adults > 0 ? `${adults} adult${adults !== 1 ? 's' : ''}` : '',
    children > 0 ? `${children} child${children !== 1 ? 'ren' : ''}` : '',
  ].filter(Boolean).join(', ')

  const venueStops = getVenueStops(result.stops)

  // Build render list: interleave venue stops with lunch cards
  // Track venue stop index for drag purposes
  let venueStepNumber = 0
  let venueStopIndex = 0

  return (
    <div className="flex flex-col gap-4">

      {/* Summary banner */}
      <div className={`rounded-xl p-4 ${infeasibleCount === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          {infeasibleCount === 0 ? (
            <>
              <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span className="text-sm font-semibold text-emerald-800">All stops fit</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-sm font-semibold text-amber-800">{infeasibleCount} stop{infeasibleCount !== 1 ? 's' : ''} can't be scheduled</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/70 rounded-lg px-2 py-1.5 text-center">
            <p className="text-lg font-bold text-navy">{feasibleVenueStops.length}</p>
            <p className="text-xs text-navy-muted">stops</p>
          </div>
          <div className="bg-white/70 rounded-lg px-2 py-1.5 text-center">
            <p className="text-lg font-bold text-navy">{durationLabel}</p>
            <p className="text-xs text-navy-muted">total</p>
          </div>
          <div className="bg-white/70 rounded-lg px-2 py-1.5 text-center">
            <p className="text-sm font-bold text-navy leading-tight">{startTime}–{result.endTime}</p>
            <p className="text-xs text-navy-muted">window</p>
          </div>
        </div>
        {guestLabel && <p className="text-xs text-navy-muted mt-2">{guestLabel}</p>}
      </div>

      {result.hasInfeasible && <FeasibilityBanner />}

      {venueStops.length > 1 && (
        <p className="text-xs text-slate-400 text-center">Drag stops to reorder</p>
      )}

      <div className="flex flex-col gap-2">
        {result.stops.map((stop, idx) => {
          if ('isLunch' in stop && stop.isLunch) {
            return <LunchStepCard key={`lunch-${idx}`} stop={stop} />
          }

          const currentVenueIndex = venueStopIndex
          venueStopIndex++
          venueStepNumber++

          return (
            <div
              key={'venue' in stop ? stop.venue.id : idx}
              draggable
              onDragStart={() => { dragIndexRef.current = currentVenueIndex }}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(currentVenueIndex) }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={() => {
                if (dragIndexRef.current !== null) {
                  reorder(dragIndexRef.current, currentVenueIndex)
                }
                dragIndexRef.current = null
                setDragOverIndex(null)
              }}
              onDragEnd={() => { dragIndexRef.current = null; setDragOverIndex(null) }}
              className={`transition-opacity ${dragOverIndex === currentVenueIndex && dragIndexRef.current !== currentVenueIndex ? 'opacity-50' : 'opacity-100'}`}
            >
              <RouteStep stop={stop} stepNumber={venueStepNumber} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
