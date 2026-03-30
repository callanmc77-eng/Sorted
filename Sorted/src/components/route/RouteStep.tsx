import type { RouteStop } from '@/types/itinerary'
import { useBookingStore } from '@/store/bookingStore'
import { cn } from '@/utils/cn'

interface Props {
  stop: RouteStop
  stepNumber: number
}

export function RouteStep({ stop, stepNumber }: Props) {
  const isFeasible = stop.feasible
  const bufferMins = useBookingStore((s) => s.bufferMins)

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        isFeasible
          ? 'bg-surface-card border-slate-200'
          : 'bg-red-50 border-red-200',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
            isFeasible ? 'bg-navy text-white' : 'bg-red-400 text-white',
          )}
        >
          {stepNumber}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy leading-tight">{stop.venue.name}</p>

          {isFeasible ? (
            <>
              {/* Show arrival → entry → departure */}
              {stop.entryTime ? (
                <div className="mt-0.5">
                  <p className="text-xs text-navy-muted">
                    Arrive {stop.arrivalTime} · Enter {stop.entryTime} → {stop.departureTime}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {stop.waitMins} min wait for slot
                  </p>
                </div>
              ) : (
                <p className="text-xs text-navy-muted mt-0.5">
                  {stop.arrivalTime} → {stop.departureTime}
                </p>
              )}

              <p className="text-xs text-slate-400 mt-0.5">
                {stop.travelFromPrev > 0 ? `${stop.travelFromPrev} min travel` : 'Starting point'}
                {bufferMins > 0 && ` · ${bufferMins} min buffer after`}
              </p>
            </>
          ) : (
            <p className="text-xs text-red-600 mt-1 leading-snug">{stop.reason}</p>
          )}
        </div>
      </div>
    </div>
  )
}
