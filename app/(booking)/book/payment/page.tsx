'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { StepIndicator } from '@/components/booking/step-indicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Summary {
  customer: { name: string; email: string; phone: string }
  pet: { name: string; species: string; breed: string; age: number; weight: number }
  slot: { id: string; datetime: string; duration_minutes: number; vet: { name: string } }
  answers: { question: string; answer: string }[]
}

export default function BookStep5() {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const customer = JSON.parse(sessionStorage.getItem('booking_customer') ?? 'null')
      const pet = JSON.parse(sessionStorage.getItem('booking_pet') ?? 'null')
      const slot = JSON.parse(sessionStorage.getItem('booking_slot') ?? 'null')
      const answers = JSON.parse(sessionStorage.getItem('booking_answers') ?? 'null')
      if (customer && pet && slot && answers) {
        setSummary({ customer, pet, slot, answers })
      } else {
        router.push('/book')
      }
    } catch {
      router.push('/book')
    }
  }, [router])

  async function handlePay() {
    if (!summary) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: summary.customer,
          pet: summary.pet,
          slotId: summary.slot.id,
          answers: summary.answers,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      // Clear session storage and redirect to Stripe
      sessionStorage.removeItem('booking_customer')
      sessionStorage.removeItem('booking_pet')
      sessionStorage.removeItem('booking_slot')
      sessionStorage.removeItem('booking_answers')

      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (!summary) return null

  return (
    <div>
      <StepIndicator currentStep={5} />
      <Card>
        <CardHeader>
          <CardTitle>Review & Pay</CardTitle>
          <CardDescription>Check your booking details before completing payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-semibold text-zinc-700">Your Details</p>
            <p className="text-sm">{summary.customer.name}</p>
            <p className="text-sm text-zinc-500">{summary.customer.email} · {summary.customer.phone}</p>
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-sm font-semibold text-zinc-700">Pet</p>
            <p className="text-sm">{summary.pet.name} · {summary.pet.species} ({summary.pet.breed})</p>
            <p className="text-sm text-zinc-500">{summary.pet.age} yrs · {summary.pet.weight} kg</p>
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-sm font-semibold text-zinc-700">Appointment</p>
            <p className="text-sm">
              {format(new Date(summary.slot.datetime), 'EEEE d MMMM yyyy, h:mm a')}
            </p>
            <p className="text-sm text-zinc-500">with {summary.slot.vet.name} · {summary.slot.duration_minutes} min</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">A$75.00</span>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={loading}>
              Back
            </Button>
            <Button className="flex-1" onClick={handlePay} disabled={loading}>
              {loading ? 'Redirecting to payment…' : 'Pay A$75.00'}
            </Button>
          </div>

          <p className="text-center text-xs text-zinc-400">
            Secure payment via Stripe. You will receive a confirmation email after payment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
