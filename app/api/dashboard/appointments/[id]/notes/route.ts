import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const Schema = z.object({ vet_notes: z.string() })

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const appointment = await prisma.appointment.findFirst({
    where: { id, vet_id: user.id },
  })

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.consultation.upsert({
    where: { appointment_id: id },
    update: { vet_notes: parsed.data.vet_notes },
    create: { appointment_id: id, vet_notes: parsed.data.vet_notes },
  })

  return NextResponse.json({ ok: true })
}
