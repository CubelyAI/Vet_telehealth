import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/dashboard/status-badge'
import type { AppointmentStatus } from '@prisma/client'

interface Props {
  searchParams: Promise<{ status?: string; date?: string }>
}

export default async function AppointmentsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { status, date } = await searchParams

  const where: Record<string, unknown> = { vet_id: user.id }
  if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    where.status = status as AppointmentStatus
  }
  if (date) {
    const d = new Date(date)
    where.datetime = {
      gte: new Date(d.setHours(0, 0, 0, 0)),
      lte: new Date(d.setHours(23, 59, 59, 999)),
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { pet: true },
    orderBy: { datetime: 'desc' },
  })

  const statusOptions = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Appointments</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <Link
            key={s || 'all'}
            href={s ? `/dashboard/appointments?status=${s}` : '/dashboard/appointments'}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              (status ?? '') === s
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            {s || 'All'}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">No appointments found.</p>
          ) : (
            <div className="divide-y">
              {appointments.map((appt) => (
                <Link
                  key={appt.id}
                  href={`/dashboard/appointments/${appt.id}`}
                  className="flex items-center justify-between py-3 px-2 rounded-md hover:bg-zinc-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{appt.customer_name}</p>
                    <p className="text-sm text-zinc-500">
                      {appt.pet?.name} · {formatDate(appt.datetime)}
                    </p>
                    <p className="text-xs text-zinc-400">{appt.customer_email}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
