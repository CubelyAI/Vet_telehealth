import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { statusVariant } from '@/components/dashboard/status-badge'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const [todayAppointments, allCounts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        vet_id: user.id,
        datetime: { gte: todayStart, lte: todayEnd },
      },
      include: { pet: true },
      orderBy: { datetime: 'asc' },
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      where: { vet_id: user.id },
      _count: true,
    }),
  ])

  const counts = Object.fromEntries(allCounts.map((r) => [r.status, r._count]))

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Dashboard</h1>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts[status] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">No appointments scheduled for today.</p>
          ) : (
            <div className="divide-y">
              {todayAppointments.map((appt) => (
                <Link
                  key={appt.id}
                  href={`/dashboard/appointments/${appt.id}`}
                  className="flex items-center justify-between py-3 hover:bg-zinc-50 px-2 rounded-md transition-colors"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{appt.customer_name}</p>
                    <p className="text-sm text-zinc-500">
                      {appt.pet?.name} ({appt.pet?.species}) · {formatDate(appt.datetime)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(appt.status)}>{appt.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
