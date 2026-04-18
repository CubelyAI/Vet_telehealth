import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Separator } from '@/components/ui/separator'
import { VetNotesForm } from '@/components/dashboard/vet-notes-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const appointment = await prisma.appointment.findFirst({
    where: { id, vet_id: user.id },
    include: {
      pet: true,
      questionnaire: true,
      consultation: true,
    },
  })

  if (!appointment) notFound()

  const answers = appointment.questionnaire?.answers as { question: string; answer: string }[] ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{appointment.customer_name}</h1>
          <p className="text-zinc-500">{formatDate(appointment.datetime)}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Email:</span> {appointment.customer_email}</p>
            <p><span className="font-medium">Phone:</span> {appointment.customer_phone}</p>
          </CardContent>
        </Card>

        {/* Pet Info */}
        {appointment.pet && (
          <Card>
            <CardHeader><CardTitle>Pet</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {appointment.pet.name}</p>
              <p><span className="font-medium">Species:</span> {appointment.pet.species}</p>
              <p><span className="font-medium">Breed:</span> {appointment.pet.breed}</p>
              <p><span className="font-medium">Age:</span> {appointment.pet.age} years</p>
              <p><span className="font-medium">Weight:</span> {appointment.pet.weight} kg</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Questionnaire */}
      {answers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Health Questionnaire</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {answers.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-zinc-700">{item.question}</p>
                <p className="mt-1 text-sm text-zinc-600">{item.answer}</p>
                {i < answers.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Vet Notes */}
      <VetNotesForm
        appointmentId={appointment.id}
        initialNotes={appointment.consultation?.vet_notes ?? ''}
      />
    </div>
  )
}
