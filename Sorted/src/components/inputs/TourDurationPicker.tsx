import { useBookingStore } from '@/store/bookingStore'
import type { TourDuration } from '@/types/itinerary'

const OPTIONS: { value: TourDuration; label: string; sub: string }[] = [
  { value: 'half', label: 'Half day', sub: 'Ends ~13:00' },
  { value: 'full', label: 'Full day', sub: 'Ends ~18:00' },
  { value: 'custom', label: 'Custom', sub: 'Set end time' },
]

export function TourDurationPicker() {
  const { tourDuration, endTime, setTourDuration, setEndTime } = useBookingStore()

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Tour length</span>

      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTourDuration(opt.value)}
            className={`flex-1 py-1.5 px-1 rounded-md text-center transition-colors
              ${tourDuration === opt.value
                ? 'bg-white text-navy shadow-sm border border-slate-200'
                : 'text-navy-muted hover:text-navy'
              }`}
          >
            <div className="text-xs font-medium leading-tight">{opt.label}</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{opt.sub}</div>
          </button>
        ))}
      </div>

      {tourDuration === 'custom' && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-navy-muted">End by</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-navy flex-1
                       focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
          />
        </div>
      )}
    </label>
  )
}
