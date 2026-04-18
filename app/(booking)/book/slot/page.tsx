'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, isSameDay } from 'date-fns'
import { Calendar } from 'lucide-react'
import { StepIndicator } from '@/components/booking/step-indicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Slot {
  id: string
  datetime: string
  duration_minutes: number
  vet: { id: string; name: string }
}

export default function BookStep3() {
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/availability')
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const uniqueDates = Array.from(
    new Set(slots.map((s) => format(new Date(s.datetime), 'yyyy-MM-dd')))
  )

  const slotsForDate = selectedDate
    ? slots.filter((s) => isSameDay(new Date(s.datetime), new Date(selectedDate)))
    : []

  function handleContinue() {
    if (!selectedSlot) return
    sessionStorage.setItem('booking_slot', JSON.stringify(selectedSlot))
    router.push('/book/questionnaire')
  }

  return (
    <div>
      <StepIndicator currentStep={3} />
      <Card>
        <CardHeader>
          <CardTitle>Choose a Time Slot</CardTitle>
          <CardDescription>Select a date and then an available time.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-zinc-500">Loading available slots…</p>
          ) : uniqueDates.length === 0 ? (
            <p className="py-8 text-center text-zinc-500">No available slots at the moment. Please check back soon.</p>
          ) : (
            <div className="space-y-6">
              {/* Date picker */}
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-700">Select a date</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueDates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                      className={cn(
                        'rounded-md border px-3 py-2 text-sm transition-colors',
                        selectedDate === d
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 hover:border-zinc-400'
                      )}
                    >
                      <Calendar className="mr-1 inline h-3.5 w-3.5" />
                      {format(new Date(d), 'EEE d MMM')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-700">Select a time</p>
                  <div className="grid grid-cols-3 gap-2">
                    {slotsForDate.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          'rounded-md border px-3 py-2 text-sm transition-colors',
                          selectedSlot?.id === slot.id
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 hover:border-zinc-400'
                        )}
                      >
                        {format(new Date(slot.datetime), 'h:mm a')}
                        <span className="block text-xs opacity-60">{slot.vet.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSlot && (
                <p className="rounded-md bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                  Selected: <strong>{format(new Date(selectedSlot.datetime), 'EEEE d MMMM, h:mm a')}</strong> with {selectedSlot.vet.name} ({selectedSlot.duration_minutes} min)
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Back</Button>
            <Button className="flex-1" disabled={!selectedSlot} onClick={handleContinue}>
              Continue to Health Questions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
