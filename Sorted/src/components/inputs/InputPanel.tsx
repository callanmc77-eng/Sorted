import { useBookingStore } from '@/store/bookingStore'
import { DatePicker } from './DatePicker'
import { PaxInput } from './PaxInput'
import { StartTimePicker } from './StartTimePicker'
import { TourDurationPicker } from './TourDurationPicker'
import { StartLocationInput } from './StartLocationInput'
import { TransportToggle } from './TransportToggle'
import { BufferInput } from './BufferInput'
import { LunchInput } from './LunchInput'

interface Props {
  isLoaded: boolean
}

export function InputPanel({ isLoaded }: Props) {
  const { date, startTime, startLocation, transportMode,
          setDate, setStartTime, setStartLocation, setTransportMode } = useBookingStore()

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wider">
        Trip Details
      </h2>

      <DatePicker value={date} onChange={setDate} />
      <PaxInput />

      <StartTimePicker value={startTime} onChange={setStartTime} />
      <TourDurationPicker />

      <StartLocationInput value={startLocation} onChange={setStartLocation} isLoaded={isLoaded} />
      <TransportToggle value={transportMode} onChange={setTransportMode} />

      <div className="border-t border-slate-100 pt-5 flex flex-col gap-5">
        <LunchInput />
        <BufferInput />
      </div>
    </div>
  )
}
