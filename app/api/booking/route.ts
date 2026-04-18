import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { generateBookingToken } from '@/lib/booking-token'

const BookingSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(8),
  }),
  pet: z.object({
    name: z.string().min(1),
    species: z.string().min(1),
    breed: z.string().min(1),
    age: z.number().int().min(0),
    weight: z.number().positive(),
  }),
  slotId: z.string().uuid(),
  answers: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = BookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { customer, pet, slotId, answers } = parsed.data

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    })

    if (!slot || slot.is_booked) {
      return NextResponse.json({ error: 'Slot is no longer available' }, { status: 409 })
    }

    const bookingToken = generateBookingToken()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const { appointment } = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          datetime: slot.datetime,
          status: 'PENDING',
          vet_id: slot.vet_id,
          slot_id: slot.id,
          booking_token: bookingToken,
        },
      })

      await tx.pet.create({
        data: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          appointment_id: appointment.id,
        },
      })

      await tx.questionnaireResponse.create({
        data: {
          appointment_id: appointment.id,
          answers: answers,
        },
      })

      return { appointment }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Vet Telehealth Consultation',
              description: `Appointment on ${slot.datetime.toLocaleDateString('en-AU')}`,
            },
            unit_amount: 7500, // $75.00 AUD in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointment_id: appointment.id,
        booking_token: bookingToken,
        slot_id: slotId,
      },
      customer_email: customer.email,
      success_url: `${appUrl}/confirmation/${bookingToken}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book`,
    })

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { stripe_session_id: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('POST /api/booking error:', error)
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
  }
}
