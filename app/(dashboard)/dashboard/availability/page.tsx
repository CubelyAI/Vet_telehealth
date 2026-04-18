import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvailabilityManager } from '@/components/dashboard/availability-manager'

export default async function AvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const slots = await prisma.availabilitySlot.findMany({
    where: { vet_id: user.id, datetime: { gte: new Date() } },
    orderBy: { datetime: 'asc' },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Availability</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <AvailabilityManager vetId={user.id} />

        <Card>
          <CardHeader><CardTitle>Upcoming Slots</CardTitle></CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-400">No upcoming slots. Add one to start accepting bookings.</p>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{formatDate(slot.datetime)}</p>
                      <p className="text-xs text-zinc-500">{slot.duration_minutes} min</p>
                    </div>
                    <Badge variant={slot.is_booked ? 'secondary' : 'success'}>
                      {slot.is_booked ? 'Booked' : 'Available'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
