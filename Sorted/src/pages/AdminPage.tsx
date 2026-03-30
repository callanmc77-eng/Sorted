import { useAdminStore } from '@/store/adminStore'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { VenueTable } from '@/components/admin/VenueTable'
import { CityManager } from '@/components/admin/CityManager'

export function AdminPage() {
  const { isAuthenticated, logout, resetToDefaults } = useAdminStore()

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm">
          <h1 className="text-navy text-xl font-semibold mb-1">Admin panel</h1>
          <p className="text-xs text-navy-muted mb-6">Sorted venue manager</p>
          <AdminLoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-navy text-2xl font-semibold">Venue Manager</h1>
          <p className="text-xs text-navy-muted mt-1">
            Changes are saved to this browser only. All consultants must use the same machine, or re-apply changes on each browser.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Reset all venues and cities to built-in defaults? Your edits will be lost.')) {
                resetToDefaults()
              }
            }}
            className="text-xs text-navy-muted border border-slate-200 px-3 py-1.5 rounded-lg
                       hover:border-slate-300 hover:text-navy transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={logout}
            className="text-xs text-navy-muted border border-slate-200 px-3 py-1.5 rounded-lg
                       hover:border-slate-300 hover:text-navy transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Venue table */}
      <VenueTable />

      {/* City manager */}
      <div className="mt-10">
        <h2 className="text-navy text-lg font-semibold mb-4">Cities</h2>
        <CityManager />
      </div>
    </div>
  )
}
