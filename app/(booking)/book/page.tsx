'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CustomerSchema, type CustomerData } from '@/lib/booking-schema'
import { StepIndicator } from '@/components/booking/step-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BookStep1() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerData>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: (() => {
      if (typeof window === 'undefined') return {}
      try {
        const saved = sessionStorage.getItem('booking_customer')
        return saved ? JSON.parse(saved) : {}
      } catch {
        return {}
      }
    })(),
  })

  function onSubmit(data: CustomerData) {
    sessionStorage.setItem('booking_customer', JSON.stringify(data))
    router.push('/book/pet')
  }

  return (
    <div>
      <StepIndicator currentStep={1} />
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
          <CardDescription>Let us know who to contact about the appointment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Jane Smith" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="0400 000 000" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <Button type="submit" className="w-full">Continue to Pet Details</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
