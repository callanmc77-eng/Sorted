import type { LunchStop, ScheduledStop, InfeasibleStop } from '@/types/itinerary'
import { cn } from '@/utils/cn'

interface Props {
  stop: ScheduledStop | InfeasibleStop
  stepNumber: number
}

function TimeRow({ time, label, sub, accent }: { time: string; label: string; sub?: string; accent?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-11 shrink-0 text-xs font-mono text-navy tabular-nums text-right">{time}</span>
      <div className="flex-1 min-w-0">
        <span className={cn('text-xs', accent ?? 'text-navy-muted')}>{label}</span>
        {sub && <span className="text-xs text-slate-400 ml-1.5">{sub}</span>}
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="w-11 shrink-0 flex justify-center">
        <div className="w-px h-3 bg-slate-200" />
      </div>
      <div />
    </div>
  )
}

export function LunchStepCard({ stop }: { stop: LunchStop }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs">
          🍽
        </span>
        <span className="text-sm font-semibold text-navy">Lunch break</span>
        <span className="text-xs text-navy-muted ml-auto">{stop.durationMins} min</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <TimeRow time={stop.arrivalTime} label="Lunch starts" accent="text-amber-700" />
        <Divider />
        <TimeRow time={stop.departureTime} label="Resume tour" accent="text-amber-700" />
      </div>
    </div>
  )
}

export function RouteStep({ stop, stepNumber }: Props) {
  if (!stop.feasible) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-red-400 text-white flex items-center justify-center text-xs font-bold mt-0.5">
            {stepNumber}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-navy leading-tight">{stop.venue.name}</p>
            <p className="text-xs text-red-600 mt-1 leading-snug">{stop.reason}</p>
          </div>
        </div>
      </div>
    )
  }

  const rows: React.ReactNode[] = []

  if (stop.travelFromPrev > 0) {
    rows.push(<TimeRow key="travel-time" time={stop.arrivalTime} label={`Travel — ${stop.travelFromPrev} min`} accent="text-slate-400" />)
    rows.push(<Divider key="d1" />)
  }

  if (stop.waitMins > 0 && stop.entryTime) {
    rows.push(<TimeRow key="arrive" time={stop.travelFromPrev > 0 ? '' : stop.arrivalTime} label="Arrive" accent="text-navy-muted" />)
    rows.push(<Divider key="d2" />)
    rows.push(<TimeRow key="wait" time={stop.entryTime} label={`Wait for slot — ${stop.waitMins} min`} accent="text-amber-600" />)
    rows.push(<Divider key="d3" />)
  } else if (stop.travelFromPrev === 0) {
    rows.push(<TimeRow key="start" time={stop.arrivalTime} label="Start" accent="text-navy-muted" />)
    rows.push(<Divider key="d0" />)
  }

  rows.push(<TimeRow key="entry" time={stop.entryTime ?? stop.arrivalTime} label={`Visit — ${stop.venue.avgVisitDurationMins} min`} accent="text-navy font-medium" />)
  rows.push(<Divider key="d4" />)
  rows.push(<TimeRow key="depart" time={stop.departureTime} label="Depart" accent="text-navy-muted" />)

  if (stop.bufferMins > 0) {
    rows.push(<Divider key="d5" />)
    rows.push(<TimeRow key="buffer" time="" label={`Buffer — ${stop.bufferMins} min`} accent="text-slate-400" />)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-surface-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
          {stepNumber}
        </span>
        <p className="text-sm font-semibold text-navy leading-tight">{stop.venue.name}</p>
      </div>
      <div className="flex flex-col gap-0.5">{rows}</div>
    </div>
  )
}
