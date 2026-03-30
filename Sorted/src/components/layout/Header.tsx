import { Link, useLocation } from 'react-router-dom'
import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'

export function Header() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'
  const isPlan = pathname === '/plan'
  const cityId = useBookingStore((s) => s.cityId)
  const cities = useAdminStore((s) => s.cities)
  const cityName = cities.find((c) => c.id === cityId)?.name ?? ''

  return (
    <header className="bg-navy h-14 flex items-center px-6 shrink-0 gap-3">
      <Link to="/" className="text-white font-semibold text-lg tracking-tight no-underline">
        Sorted
      </Link>

      {isPlan && cityName && (
        <>
          <span className="text-white/30 text-sm">/</span>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm no-underline"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            {cityName}
          </Link>
        </>
      )}

      <div className="flex-1" />

      {isAdmin ? (
        <span className="text-white/60 text-sm">Admin Panel</span>
      ) : (
        <Link
          to="/admin"
          className="text-white/50 hover:text-white/80 text-xs transition-colors no-underline"
        >
          Admin
        </Link>
      )}
    </header>
  )
}
