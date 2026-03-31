import { useRef, useState, useEffect } from 'react'
import type { RouteResult, ScheduledStop, RouteStop } from '@/types/itinerary'
import { RouteStep, LunchStepCard, DragHandle } from './RouteStep'
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
  const scrollElRef = useRef<HTMLElement | null>(null)
  const scrollRafRef = useRef<number | null>(null)
  const dragYRef = useRef(0)

  // Auto-scroll while dragging near the edges of the right panel
  function startAutoScroll(el: HTMLElement) {
    scrollElRef.current = el
    function tick() {
      const container = scrollElRef.current
      if (!container || dragIndexRef.current === null) return
      const rect = container.getBoundingClientRect()
      const y = dragYRef.current
      const ZONE = 80
      const SPEED = 8
      if (y < rect.top + ZONE && y > rect.top) {
        container.scrollTop -= SPEED * (1 - (y - rect.top) / ZONE)
      } else if (y > rect.bottom - ZONE && y < rect.bottom) {
        container.scrollTop += SPEED * (1 - (rect.bottom - y) / ZONE)
      }
      scrollRafRef.current = requestAnimationFrame(tick)
    }
    scrollRafRef.current = requestAnimationFrame(tick)
  }

  function stopAutoScroll() {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current)
      scrollRafRef.current = null
    }
    scrollElRef.current = null
  }

  useEffect(() => () => stopAutoScroll(), [])

  const feasibleVenueStops = result.stops.filter(
    (s): s is ScheduledStop => s.feasible && !('isLunch' in s),
  )
  const infeasibleCount = result.stops.filter((s) => !s.feasible).length
  const lateCount = result.stops.filter((s): s is ScheduledStop => s.feasible && !('isLunch' in s) && !!s.lateWarning).length
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
      <div className={`rounded-xl p-4 ${infeasibleCount > 0 ? 'bg-red-50 border border-red-200' : lateCount > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          {infeasibleCount > 0 ? (
            <>
              <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-sm font-semibold text-red-800">{infeasibleCount} stop{infeasibleCount !== 1 ? 's' : ''} can't be scheduled</span>
            </>
          ) : lateCount > 0 ? (
            <>
              <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-sm font-semibold text-amber-800">Runs past target end time</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span className="text-sm font-semibold text-emerald-800">All stops fit</span>
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

      {infeasibleCount > 0 && <FeasibilityBanner />}

      <div className="flex flex-col gap-2">
        {result.stops.map((stop, idx) => {
          if ('isLunch' in stop && stop.isLunch) {
            return <LunchStepCard key={`lunch-${idx}`} stop={stop} />
          }

          const currentVenueIndex = venueStopIndex
          venueStopIndex++
          venueStepNumber++

          return (
            <div key={'venue' in stop ? stop.venue.id : idx}>
              {/* Drop placeholder shown above this card when dragging over it */}
              {dragOverIndex === currentVenueIndex && dragIndexRef.current !== null && dragIndexRef.current !== currentVenueIndex && (
                <div className="h-14 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 mb-2" />
              )}
              <div
                draggable={venueStops.length > 1}
                onDragStart={(e) => {
                  dragIndexRef.current = currentVenueIndex
                  // Find the scrollable panel ancestor and start auto-scroll
                  let el = e.currentTarget.parentElement
                  while (el) {
                    const ov = window.getComputedStyle(el).overflowY
                    if (ov === 'auto' || ov === 'scroll') { startAutoScroll(el); break }
                    el = el.parentElement
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  dragYRef.current = e.clientY
                  setDragOverIndex(currentVenueIndex)
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => {
                  if (dragIndexRef.current !== null) reorder(dragIndexRef.current, currentVenueIndex)
                  dragIndexRef.current = null
                  setDragOverIndex(null)
                  stopAutoScroll()
                }}
                onDragEnd={() => {
                  dragIndexRef.current = null
                  setDragOverIndex(null)
                  stopAutoScroll()
                }}
                className={`flex items-stretch gap-1.5 transition-opacity ${dragOverIndex === currentVenueIndex && dragIndexRef.current !== currentVenueIndex ? 'opacity-40' : 'opacity-100'}`}
              >
                {venueStops.length > 1 && <DragHandle />}
                <div className="flex-1 min-w-0">
                  <RouteStep stop={stop} stepNumber={venueStepNumber} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
