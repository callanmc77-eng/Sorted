import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import type { City } from '@/types/venue'

export function CityManager() {
  const { cities, addCity, removeCity } = useAdminStore()
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const city: City = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name.trim(),
      defaultLat: parseFloat(lat),
      defaultLng: parseFloat(lng),
    }
    addCity(city)
    setName(''); setLat(''); setLng('')
  }

  return (
    <div>
      <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-navy-muted">City</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-navy-muted">ID</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-navy font-medium">{c.name}</td>
                <td className="px-4 py-3 text-navy-muted font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove "${c.name}"?`)) removeCity(c.id)
                    }}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="flex items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-navy-muted font-medium">City name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. London"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 w-36" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-navy-muted font-medium">Lat</span>
          <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="53.34"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 w-28" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-navy-muted font-medium">Lng</span>
          <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-6.26"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 w-28" />
        </label>
        <button type="submit"
          className="py-2 px-4 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors">
          Add
        </button>
      </form>
    </div>
  )
}
