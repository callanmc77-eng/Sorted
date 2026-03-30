import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'
import { CitySelector } from './CitySelector'
import { DatePicker } from './DatePicker'
import { PaxInput } from './PaxInput'
import { StartTimePicker } from './StartTimePicker'
import { TourDurationPicker } from './TourDurationPicker'
import { StartLocationInput } from './StartLocationInput'
import { TransportToggle } from './TransportToggle'
import { BufferInput } from './BufferInput'

export function InputPanel() {
  const { cityId, date, pax, startTime, startLocation, transportMode,
          setCity, setDate, setPax, setStartTime, setStartLocation, setTransportMode } = useBookingStore()
  const { cities } = useAdminStore()

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wider">
        Trip Details
      </h2>

      <CitySelector value={cityId} onChange={setCity} cities={cities} />
      <DatePicker value={date} onChange={setDate} />
      <PaxInput value={pax} onChange={setPax} />

      <div className="grid grid-cols-2 gap-3">
        <StartTimePicker value={startTime} onChange={setStartTime} />
        <TourDurationPicker />
      </div>

      <StartLocationInput value={startLocation} onChange={setStartLocation} />
      <TransportToggle value={transportMode} onChange={setTransportMode} />

      <div className="border-t border-slate-100 pt-5">
        <BufferInput />
      </div>
    </div>
  )
}
