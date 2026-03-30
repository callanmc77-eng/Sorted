import { useBookingStore } from '@/store/bookingStore'
import { DatePicker } from './DatePicker'
import { PaxInput } from './PaxInput'
import { StartTimePicker } from './StartTimePicker'
import { TourDurationPicker } from './TourDurationPicker'
import { StartLocationInput } from './StartLocationInput'
import { TransportToggle } from './TransportToggle'
import { BufferInput } from './BufferInput'

interface Props {
  isLoaded: boolean
}

export function InputPanel({ isLoaded }: Props) {
  const { date, pax, startTime, startLocation, transportMode,
          setDate, setPax, setStartTime, setStartLocation, setTransportMode } = useBookingStore()

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wider">
        Trip Details
      </h2>

      <DatePicker value={date} onChange={setDate} />
      <PaxInput value={pax} onChange={setPax} />

      <div className="grid grid-cols-2 gap-3">
        <StartTimePicker value={startTime} onChange={setStartTime} />
        <TourDurationPicker />
      </div>

      <StartLocationInput value={startLocation} onChange={setStartLocation} isLoaded={isLoaded} />
      <TransportToggle value={transportMode} onChange={setTransportMode} />

      <div className="border-t border-slate-100 pt-5">
        <BufferInput />
      </div>
    </div>
  )
}
