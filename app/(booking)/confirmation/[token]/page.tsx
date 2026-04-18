import { notFound } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { isValidBookingToken } from '@/lib/booking-token'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Props {
  params: Promise<{ token: string }>
}

async function getAppointmentByToken(token: string) {
  // Set RLS session variable via raw SQL before querying
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.booking_token = '${token.replace(/'/g, "''")}'`
  )

  return prisma.appointment.findUnique({
    where: { booking_token: token },
    include: { pet: true, vet: true },
  })
}

export default async function ConfirmationPage({ params }: Props) {
  const { token } = await params

  if (!isValidBookingToken(token)) notFound()

  const appointment = await getAppointmentByToken(token)

  if (!appointment) notFound()

  return (
    <div>
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold text-zinc-900">Booking Confirmed!</h1>
        <p className="mt-2 text-zinc-500">
          A confirmation email has been sent to <strong>{appointment.customer_email}</strong>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-zinc-700">Date & Time</p>
            <p className="text-sm">{formatDate(appointment.datetime)}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-semibold text-zinc-700">Vet</p>
            <p className="text-sm">{appointment.vet.name}</p>
          </div>
          <Separator />
          {appointment.pet && (
            <>
              <div>
                <p className="text-sm font-semibold text-zinc-700">Pet</p>
                <p className="text-sm">
                  {appointment.pet.name} · {appointment.pet.species} ({appointment.pet.breed})
                </p>
                <p className="text-sm text-zinc-500">
                  {appointment.pet.age} yrs · {appointment.pet.weight} kg
                </p>
              </div>
              <Separator />
            </>
          )}
          <div>
            <p className="text-sm font-semibold text-zinc-700">Booking Reference</p>
            <p className="font-mono text-xs text-zinc-500">{token}</p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Save this page URL — it's your booking reference. You can return here anytime to view your appointment.
      </p>
    </div>
  )
}
