'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  appointmentId: string
  initialNotes: string
}

export function VetNotesForm({ appointmentId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/appointments/${appointmentId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vet_notes: notes }),
      })
      if (res.ok) {
        toast({ title: 'Notes saved successfully.' })
      } else {
        toast({ title: 'Failed to save notes.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Consultation Notes</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Enter your consultation notes here…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
        />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Notes'}
        </Button>
      </CardContent>
    </Card>
  )
}
