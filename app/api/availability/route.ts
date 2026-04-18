import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const slots = await prisma.availabilitySlot.findMany({
      where: { is_booked: false, datetime: { gte: new Date() } },
      include: { vet: { select: { id: true, name: true } } },
      orderBy: { datetime: 'asc' },
    })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('GET /api/availability error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
