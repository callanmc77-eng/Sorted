import { useRef, useState, useCallback, useEffect } from 'react'
import type { RouteResult, ScheduledStop, RouteStop } from '@/types/itinerary'
import { RouteStep, LunchStepCard, DragHandle } from './RouteStep'
import { FeasibilityBanner } from './FeasibilityBanner'
import { useBookingStore } from '@/store/bookingStore'
import { useReorderStops } from '@/hooks/useReorderStops'

interface Props {
  result: RouteResult
}

function getVenueStops(stops: RouteStop[]): (ScheduledStop | Extract<RouteStop, { feasible: false }>)[] {
  return stops.filter((s): s is ScheduledStop | Extract<RouteStop, { feasible: false }> => !('isLunch' in s))
}

export function RoutePanel({ result }: Props) {
  const { startTime, adults, children } = useBookingStore()
  const { reorder } = useReorderStops()

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  // Refs that survive renders without causing them
  const dragIndexRef = useRef<number | null>(null)
  const cloneRef = useRef<HTMLDivElement | null>(null)
  const itemElemsRef = useRef<(HTMLDivElement | null)[]>([])
  const grabOffsetRef = useRef({ x: 0, y: 0 })
  const scrollElRef = useRef<HTMLElement | null>(null)
  const scrollRafRef = useRef<number | null>(null)
  const pointerYRef = useRef(0)
  const pointerXRef = useRef(0)

  const venueStops = getVenueStops(result.stops)
  const canDrag = venueStops.length > 1

  const feasibleVenueStops = result.stops.filter((s): s is ScheduledStop => s.feasible && !('isLunch' in s))
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

  // ── Scroll auto-advance ────────────────────────────────────────────────────
  function stopScrolling() {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current)
      scrollRafRef.current = null
    }
  }

  function startScrolling() {
    stopScrolling()
    function tick() {
      const el = scrollElRef.current
      if (!el || dragIndexRef.current === null) return
      const rect = el.getBoundingClientRect()
      const y = pointerYRef.current
      const ZONE = 80
      const SPEED = 10
      if (y < rect.top + ZONE) {
        el.scrollTop -= SPEED * (1 - (y - rect.top) / ZONE)
        refreshRects()
      } else if (y > rect.bottom - ZONE) {
        el.scrollTop += SPEED * (1 - (rect.bottom - y) / ZONE)
        refreshRects()
      }
      scrollRafRef.current = requestAnimationFrame(tick)
    }
    scrollRafRef.current = requestAnimationFrame(tick)
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function refreshRects() {
    // Recompute after scroll
    itemElemsRef.current.forEach((el) => el) // no-op, rects re-read on demand
  }

  function getDropIndex(clientY: number): number {
    let best = 0
    let bestDist = Infinity
    itemElemsRef.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const mid = rect.top + rect.height / 2
      const dist = Math.abs(clientY - mid)
      if (dist < bestDist) { bestDist = dist; best = i }
    })
    return best
  }

  // ── Pointer handlers ───────────────────────────────────────────────────────
  const onPointerMove = useCallback((e: PointerEvent) => {
    pointerYRef.current = e.clientY
    pointerXRef.current = e.clientX

    // Move clone
    if (cloneRef.current) {
      cloneRef.current.style.left = `${e.clientX - grabOffsetRef.current.x}px`
      cloneRef.current.style.top = `${e.clientY - grabOffsetRef.current.y}px`
    }

    // Update drop target
    const di = getDropIndex(e.clientY)
    setDropIndex(di)
  }, [])

  const onPointerUp = useCallback(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    stopScrolling()

    cloneRef.current?.remove()
    cloneRef.current = null

    const from = dragIndexRef.current
    setDropIndex((drop) => {
      if (from !== null && drop !== null && from !== drop) {
        reorder(from, drop)
      }
      return null
    })
    dragIndexRef.current = null
    setDragIndex(null)
  }, [onPointerMove, reorder])

  function startDrag(e: React.PointerEvent<HTMLElement>, venueIndex: number) {
    if (!canDrag) return
    e.preventDefault()

    const sourceEl = itemElemsRef.current[venueIndex]
    if (!sourceEl) return

    dragIndexRef.current = venueIndex
    setDragIndex(venueIndex)
    setDropIndex(venueIndex)

    const rect = sourceEl.getBoundingClientRect()
    grabOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    pointerYRef.current = e.clientY
    pointerXRef.current = e.clientX

    // Find scroll container — walk up from source element
    let scrollEl: HTMLElement = document.documentElement as HTMLElement
    let parent = sourceEl.parentElement
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent)
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollEl = parent
        break
      }
      parent = parent.parentElement
    }
    scrollElRef.current = scrollEl

    // Build floating clone
    const clone = sourceEl.cloneNode(true) as HTMLDivElement
    clone.style.cssText = `
      position: fixed;
      z-index: 9999;
      width: ${rect.width}px;
      left: ${rect.left}px;
      top: ${rect.top}px;
      pointer-events: none;
      opacity: 0.92;
      box-shadow: 0 12px 40px rgba(15,23,41,0.22);
      border-radius: 12px;
      transform: scale(1.025);
      will-change: left, top;
    `
    document.body.appendChild(clone)
    cloneRef.current = clone

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    startScrolling()
  }

  useEffect(() => {
    return () => {
      stopScrolling()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      cloneRef.current?.remove()
    }
  }, [onPointerMove, onPointerUp])

  // ── Render ─────────────────────────────────────────────────────────────────
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

          const isDragging = dragIndex === currentVenueIndex
          const isDropTarget = dragIndex !== null && dropIndex === currentVenueIndex && !isDragging

          return (
            <div key={'venue' in stop ? stop.venue.id : idx} className="relative">
              {/* Placeholder shown at the drop position */}
              {isDropTarget && (
                <div
                  className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 mb-2 transition-all"
                  style={{ height: itemElemsRef.current[dragIndex!]?.getBoundingClientRect().height ?? 80 }}
                />
              )}

              <div
                ref={(el) => { itemElemsRef.current[currentVenueIndex] = el }}
                className={`flex items-stretch gap-1.5 ${isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                {canDrag && (
                  <div
                    onPointerDown={(e) => startDrag(e, currentVenueIndex)}
                    className="touch-none select-none cursor-grab active:cursor-grabbing"
                  >
                    <DragHandle />
                  </div>
                )}
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
