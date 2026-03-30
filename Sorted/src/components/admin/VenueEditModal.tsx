import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import type { Venue, WeeklyHours, DayOfWeek, BookingSystem, SlotType } from '@/types/venue'

interface Props {
  venue?: Venue
  onClose: () => void
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

const BOOKING_SYSTEMS: BookingSystem[] = ['direct', 'manual', 'ticketsolve', 'fareharbor', 'tock']
const SLOT_TYPES: SlotType[] = ['continuous', 'interval', 'fixed']

function emptyHours(): WeeklyHours {
  const h: Partial<WeeklyHours> = {}
  for (const d of DAYS) h[d.key] = { open: '09:00', close: '17:00' }
  return h as WeeklyHours
}

export function VenueEditModal({ venue, onClose }: Props) {
  const { addVenue, updateVenue } = useAdminStore()
  const isNew = !venue

  const [name, setName] = useState(venue?.name ?? '')
  const [address, setAddress] = useState(venue?.address ?? '')
  const [lat, setLat] = useState(String(venue?.coordinates.lat ?? ''))
  const [lng, setLng] = useState(String(venue?.coordinates.lng ?? ''))
  const [lastEntry, setLastEntry] = useState(venue?.lastEntry ?? '16:00')
  const [duration, setDuration] = useState(String(venue?.avgVisitDurationMins ?? '60'))
  const [bookingUrl, setBookingUrl] = useState(venue?.bookingUrl ?? '')
  const [bookingSystem, setBookingSystem] = useState<BookingSystem>(venue?.bookingSystem ?? 'direct')
  const [notes, setNotes] = useState(venue?.notes ?? '')
  const [cityId, setCityId] = useState(venue?.cityId ?? 'dublin')
  const [hours, setHours] = useState<WeeklyHours>(venue?.openingHours ?? emptyHours())
  const [slotType, setSlotType] = useState<SlotType>(venue?.slotType ?? 'continuous')
  const [slotIntervalMins, setSlotIntervalMins] = useState(String(venue?.slotIntervalMins ?? '30'))
  const [fixedSlotsRaw, setFixedSlotsRaw] = useState(
    venue?.fixedSlots ? venue.fixedSlots.join(', ') : ''
  )

  function setDayHours(day: DayOfWeek, field: 'open' | 'close' | 'closed', value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const data: Venue = {
      id: venue?.id ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      address,
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      openingHours: hours,
      lastEntry,
      avgVisitDurationMins: parseInt(duration, 10),
      bookingUrl,
      bookingSystem,
      notes,
      cityId,
      slotType,
      ...(slotType === 'interval' && { slotIntervalMins: parseInt(slotIntervalMins, 10) }),
      ...(slotType === 'fixed' && {
        fixedSlots: fixedSlotsRaw.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    }
    if (isNew) addVenue(data)
    else updateVenue(data.id, data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-navy font-semibold">{isNew ? 'Add venue' : `Edit — ${venue.name}`}</h2>
          <button onClick={onClose} className="text-navy-muted hover:text-navy text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Address</span>
              <input required value={address} onChange={(e) => setAddress(e.target.value)} className="input-base" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Latitude</span>
              <input required type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} className="input-base" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Longitude</span>
              <input required type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} className="input-base" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Last entry time</span>
              <input required type="time" value={lastEntry} onChange={(e) => setLastEntry(e.target.value)} className="input-base" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Avg visit (minutes)</span>
              <input required type="number" min="10" max="480" value={duration} onChange={(e) => setDuration(e.target.value)} className="input-base" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">City ID</span>
              <input required value={cityId} onChange={(e) => setCityId(e.target.value)} className="input-base" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Booking system</span>
              <select value={bookingSystem} onChange={(e) => setBookingSystem(e.target.value as BookingSystem)} className="input-base">
                {BOOKING_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Booking URL</span>
              <input required type="url" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} className="input-base" />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-xs text-navy-muted font-medium">Notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-base resize-none" />
            </label>
          </div>

          {/* Slot scheduling */}
          <div>
            <p className="text-xs font-semibold text-navy-muted uppercase tracking-wider mb-3">Entry slots</p>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-navy-muted font-medium">Slot type</span>
                <select value={slotType} onChange={(e) => setSlotType(e.target.value as SlotType)} className="input-base">
                  {SLOT_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s === 'continuous' ? 'Continuous — walk in anytime'
                        : s === 'interval' ? 'Interval — every N minutes from opening'
                        : 'Fixed — specific named time slots'}
                    </option>
                  ))}
                </select>
              </label>

              {slotType === 'interval' && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-navy-muted font-medium">Interval (minutes)</span>
                  <input type="number" min="5" max="120" value={slotIntervalMins}
                    onChange={(e) => setSlotIntervalMins(e.target.value)} className="input-base" />
                  <p className="text-xs text-slate-400">e.g. 15 means slots at open, open+15, open+30…</p>
                </label>
              )}

              {slotType === 'fixed' && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-navy-muted font-medium">Fixed slots (comma-separated)</span>
                  <input type="text" value={fixedSlotsRaw}
                    onChange={(e) => setFixedSlotsRaw(e.target.value)}
                    placeholder="09:30, 10:30, 11:30, 12:30, 13:30"
                    className="input-base" />
                  <p className="text-xs text-slate-400">24h format, e.g. 09:30, 10:30, 11:30</p>
                </label>
              )}
            </div>
          </div>

          {/* Opening hours */}
          <div>
            <p className="text-xs font-semibold text-navy-muted uppercase tracking-wider mb-3">Opening hours</p>
            <div className="flex flex-col gap-2">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-navy-muted w-20">{label}</span>
                  <input type="checkbox" checked={!!hours[key].closed}
                    onChange={(e) => setDayHours(key, 'closed', e.target.checked)}
                    className="w-4 h-4 accent-navy" />
                  <span className="text-xs text-slate-400">Closed</span>
                  {!hours[key].closed && (
                    <>
                      <input type="time" value={hours[key].open}
                        onChange={(e) => setDayHours(key, 'open', e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-navy/20" />
                      <span className="text-xs text-slate-400">to</span>
                      <input type="time" value={hours[key].close}
                        onChange={(e) => setDayHours(key, 'close', e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-navy/20" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-navy-muted rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors">
              {isNew ? 'Add venue' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
