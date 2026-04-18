import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const CreateSlotSchema = z.object({
  datetime: z.string().min(1),
  duration_minutes: z.number().int().min(15).max(120),
  vet_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateSlotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (parsed.data.vet_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      vet_id: user.id,
      datetime: new Date(parsed.data.datetime),
      duration_minutes: parsed.data.duration_minutes,
    },
  })

  return NextResponse.json({ slot }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const slotId = searchParams.get('id')

  if (!slotId) return NextResponse.json({ error: 'Missing slot id' }, { status: 400 })

  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, vet_id: user.id },
  })

  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (slot.is_booked) return NextResponse.json({ error: 'Cannot delete a booked slot' }, { status: 409 })

  await prisma.availabilitySlot.delete({ where: { id: slotId } })

  return NextResponse.json({ ok: true })
}
