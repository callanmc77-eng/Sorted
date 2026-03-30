import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'

  return (
    <header className="bg-navy h-14 flex items-center px-6 shrink-0">
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        {/* Wordmark */}
        <span className="text-white font-semibold text-lg tracking-tight">Sorted</span>
        {/* City badge */}
        {!isAdmin && (
          <span className="bg-white/10 text-white/80 text-xs font-medium px-2 py-0.5 rounded-full">
            Dublin
          </span>
        )}
      </Link>

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
