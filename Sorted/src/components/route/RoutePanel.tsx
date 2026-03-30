import type { RouteResult } from '@/types/itinerary'
import { RouteStep, LunchStepCard } from './RouteStep'
import { FeasibilityBanner } from './FeasibilityBanner'

interface Props {
  result: RouteResult
}

export function RoutePanel({ result }: Props) {
  let venueStepNumber = 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy">Your itinerary</h2>
        <span className="text-xs text-navy-muted">Ends ~{result.endTime}</span>
      </div>

      {result.hasInfeasible && <FeasibilityBanner />}

      <div className="flex flex-col gap-2">
        {result.stops.map((stop, idx) => {
          if ('isLunch' in stop && stop.isLunch) {
            return <LunchStepCard key={`lunch-${idx}`} stop={stop} />
          }
          venueStepNumber++
          return <RouteStep key={'venue' in stop ? stop.venue.id : idx} stop={stop} stepNumber={venueStepNumber} />
        })}
      </div>
    </div>
  )
}
