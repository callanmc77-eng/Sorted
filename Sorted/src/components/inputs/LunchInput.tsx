import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'

const DURATION_PRESETS = [30, 45, 60, 90]

export function LunchInput() {
  const {
    includeLunch, lunchDurationMins, lunchAfterStop,
    setIncludeLunch, setLunchDurationMins, setLunchAfterStop,
    selectedVenueIds, cityId,
  } = useBookingStore()
  const { venues } = useAdminStore()

  const selectedCount = selectedVenueIds.length
  const cityVenues = venues.filter((v) => v.cityId === cityId)
  // Build ordered label list based on selection order
  const stopOptions = selectedVenueIds.map((id, i) => {
    const venue = cityVenues.find((v) => v.id === id)
    return { index: i + 1, name: venue?.name ?? `Stop ${i + 1}` }
  })

  return (
    <div className="flex flex-col gap-2">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-navy-muted font-medium">Lunch break</span>
        <button
          type="button"
          onClick={() => setIncludeLunch(!includeLunch)}
          className={`relative inline-flex w-10 h-6 rounded-full transition-colors focus:outline-none shrink-0
            ${includeLunch ? 'bg-navy' : 'bg-slate-200'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
            ${includeLunch ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>

      {includeLunch && (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-3 flex flex-col gap-3">

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-navy-muted">Duration</span>
            <div className="flex gap-1.5 flex-wrap">
              {DURATION_PRESETS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setLunchDurationMins(mins)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                    ${lunchDurationMins === mins
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300 hover:text-navy'
                    }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* After which stop */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-navy-muted">After stop</span>
            {selectedCount === 0 ? (
              <p className="text-xs text-slate-400">Select attractions first</p>
            ) : (
              <div className="flex gap-1.5 flex-wrap">
                {stopOptions.map(({ index, name }) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setLunchAfterStop(index)}
                    title={name}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                      ${lunchAfterStop === index
                        ? 'bg-navy text-white border-navy'
                        : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300 hover:text-navy'
                      }`}
                  >
                    {index}
                  </button>
                ))}
              </div>
            )}
            {lunchAfterStop !== null && lunchAfterStop <= selectedCount && (
              <p className="text-xs text-slate-400">
                After {stopOptions[lunchAfterStop - 1]?.name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
