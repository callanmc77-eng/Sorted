import type { Venue, DayOfWeek } from '@/types/venue'
import { useBookingStore } from '@/store/bookingStore'
import { cn } from '@/utils/cn'

interface Props {
  venue: Venue
  selected: boolean
  onToggle: () => void
}

const DAY_SHORT: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function getTodayHours(venue: Venue): string {
  const day = DAY_SHORT[new Date().getDay()]
  const h = venue.openingHours[day]
  if (h.closed) return 'Closed today'
  return `${h.open}–${h.close}`
}

export function AttractionCard({ venue, selected, onToggle }: Props) {
  const { pinnedLastId, setPinnedLastId } = useBookingStore()
  const isPinned = pinnedLastId === venue.id

  function handlePinClick(e: React.MouseEvent) {
    e.stopPropagation()
    setPinnedLastId(isPinned ? null : venue.id)
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'text-left w-full rounded-xl border p-4 transition-all duration-150 focus:outline-none',
        'bg-surface-card hover:shadow-sm',
        selected ? 'border-navy ring-2 ring-navy/10' : 'border-slate-200 hover:border-slate-300',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-snug text-navy">{venue.name}</span>
        <span className={cn(
          'shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
          selected ? 'bg-navy border-navy' : 'border-slate-300 bg-white',
        )}>
          {selected && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3L3.5 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
      </div>

      <p className="text-xs text-navy-muted mt-1 leading-snug line-clamp-1">{venue.address}</p>

      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-slate-400">{getTodayHours(venue)}</span>
        <span className="text-xs text-slate-300">·</span>
        <span className="text-xs text-slate-400">~{venue.avgVisitDurationMins} min</span>
      </div>

      {selected && (
        <div className="mt-2 flex">
          <span
            role="button"
            tabIndex={0}
            onClick={handlePinClick}
            onKeyDown={(e) => e.key === 'Enter' && handlePinClick(e as unknown as React.MouseEvent)}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border transition-colors',
              isPinned
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300 hover:text-navy',
            )}
          >
            {isPinned ? 'Last stop ✓' : 'Pin last'}
          </span>
        </div>
      )}
    </button>
  )
}
