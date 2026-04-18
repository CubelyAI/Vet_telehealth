import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { getConfirmationUrl } from '@/lib/booking-token'
import { BookingConfirmationEmail } from '@/emails/confirmation'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const appointmentId = session.metadata?.appointment_id
    const bookingToken = session.metadata?.booking_token
    const slotId = session.metadata?.slot_id

    if (!appointmentId || !bookingToken || !slotId) {
      console.error('Missing metadata in checkout session', session.id)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CONFIRMED' },
      }),
      prisma.availabilitySlot.update({
        where: { id: slotId },
        data: { is_booked: true },
      }),
    ])

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { pet: true, vet: true },
    })

    if (appointment) {
      const confirmationUrl = getConfirmationUrl(bookingToken)

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: appointment.customer_email,
        subject: 'Your Vet Telehealth Appointment is Confirmed',
        react: BookingConfirmationEmail({
          customerName: appointment.customer_name,
          petName: appointment.pet?.name ?? 'your pet',
          appointmentDatetime: appointment.datetime,
          vetName: appointment.vet.name,
          confirmationUrl,
          bookingToken,
        }),
      })
    }
  }

  return NextResponse.json({ received: true })
}
