import { useBookingStore } from '@/store/bookingStore'
import type { TourDuration } from '@/types/itinerary'

const OPTIONS: { value: TourDuration; label: string; hint: string }[] = [
  { value: 'full', label: 'Full day', hint: 'Ends by 18:00' },
  { value: 'half', label: 'Half day', hint: 'Ends by 13:00' },
  { value: 'custom', label: 'Custom', hint: 'Set end time' },
]

export function TourDurationPicker() {
  const { tourDuration, endTime, setTourDuration, setEndTime } = useBookingStore()

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-navy-muted font-medium">Tour length</span>

      <div className="flex flex-col gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTourDuration(opt.value)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors
              ${tourDuration === opt.value
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-navy border-slate-200 hover:border-slate-300'
              }`}
          >
            <span className="text-xs font-medium">{opt.label}</span>
            <span className={`text-xs ${tourDuration === opt.value ? 'text-white/70' : 'text-navy-muted'}`}>
              {opt.hint}
            </span>
          </button>
        ))}
      </div>

      {tourDuration === 'custom' && (
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-navy-muted">End by</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-navy flex-1
                       focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
          />
        </div>
      )}
    </div>
  )
}
