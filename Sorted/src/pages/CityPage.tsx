import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'

export function CityPage() {
  const navigate = useNavigate()
  const { setCity } = useBookingStore()
  const { cities } = useAdminStore()

  function handleSelect(cityId: string) {
    setCity(cityId)
    navigate('/plan')
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-semibold text-navy mb-1">Where are you planning?</h1>
        <p className="text-sm text-navy-muted mb-8">Select a city to start building your itinerary.</p>

        <div className="flex flex-col gap-3">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleSelect(city.id)}
              className="w-full text-left bg-white border border-slate-200 rounded-xl px-5 py-4
                         hover:border-navy/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-navy">{city.name}</span>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-navy-muted transition-colors"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
              <p className="text-xs text-navy-muted mt-0.5">
                {/* Show venue count for this city */}
                {useAdminStore.getState().venues.filter(v => v.cityId === city.id).length} attractions
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
