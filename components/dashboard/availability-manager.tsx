'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface Props {
  vetId: string
}

export function AvailabilityManager({ vetId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [datetime, setDatetime] = useState('')
  const [duration, setDuration] = useState('30')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/dashboard/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datetime,
          duration_minutes: parseInt(duration, 10),
          vet_id: vetId,
        }),
      })

      if (res.ok) {
        toast({ title: 'Slot created successfully.' })
        setDatetime('')
        setDuration('30')
        router.refresh()
      } else {
        const data = await res.json()
        toast({ title: data.error ?? 'Failed to create slot.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Add Availability Slot</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="datetime">Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="120"
              step="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create Slot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
