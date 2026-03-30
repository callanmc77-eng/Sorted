import type { RouteResult } from '@/types/itinerary'
import { RouteStep } from './RouteStep'
import { FeasibilityBanner } from './FeasibilityBanner'

interface Props {
  result: RouteResult
}

export function RoutePanel({ result }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy">Your itinerary</h2>
        <span className="text-xs text-navy-muted">Ends ~{result.endTime}</span>
      </div>

      {result.hasInfeasible && <FeasibilityBanner />}

      <div className="flex flex-col gap-2">
        {result.stops.map((stop, idx) => (
          <RouteStep key={stop.venue.id} stop={stop} stepNumber={idx + 1} />
        ))}
      </div>
    </div>
  )
}
