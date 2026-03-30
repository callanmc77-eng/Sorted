import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import type { Venue } from '@/types/venue'
import { VenueEditModal } from './VenueEditModal'

export function VenueTable() {
  const { venues, removeVenue } = useAdminStore()
  const [editing, setEditing] = useState<Venue | null>(null)
  const [adding, setAdding] = useState(false)

  function confirmDelete(venue: Venue) {
    if (window.confirm(`Remove "${venue.name}"? This cannot be undone.`)) {
      removeVenue(venue.id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-navy font-semibold">Venues</h2>
        <button
          onClick={() => setAdding(true)}
          className="text-xs bg-navy text-white px-3 py-1.5 rounded-lg hover:bg-navy/90 transition-colors"
        >
          + Add venue
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-muted">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-muted">City</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-muted">Last entry</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-muted">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-muted">System</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {venues.map((venue) => (
              <tr key={venue.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-navy">{venue.name}</td>
                <td className="px-4 py-3 text-navy-muted capitalize">{venue.cityId}</td>
                <td className="px-4 py-3 text-navy-muted">{venue.lastEntry}</td>
                <td className="px-4 py-3 text-navy-muted">{venue.avgVisitDurationMins} min</td>
                <td className="px-4 py-3 text-navy-muted">{venue.bookingSystem}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditing(venue)}
                      className="text-xs text-navy-muted hover:text-navy transition-colors px-2 py-1
                                 rounded border border-slate-200 hover:border-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(venue)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1
                                 rounded border border-red-200 hover:border-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || adding) && (
        <VenueEditModal
          venue={editing ?? undefined}
          onClose={() => { setEditing(null); setAdding(false) }}
        />
      )}
    </div>
  )
}
