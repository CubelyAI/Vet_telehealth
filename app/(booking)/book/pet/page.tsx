'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PetSchema, type PetData, SPECIES_OPTIONS } from '@/lib/booking-schema'
import { StepIndicator } from '@/components/booking/step-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function BookStep2() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PetData>({
    resolver: zodResolver(PetSchema),
    defaultValues: (() => {
      if (typeof window === 'undefined') return {}
      try {
        const saved = sessionStorage.getItem('booking_pet')
        return saved ? JSON.parse(saved) : {}
      } catch {
        return {}
      }
    })(),
  })

  function onSubmit(data: PetData) {
    sessionStorage.setItem('booking_pet', JSON.stringify(data))
    router.push('/book/slot')
  }

  return (
    <div>
      <StepIndicator currentStep={2} />
      <Card>
        <CardHeader>
          <CardTitle>Pet Details</CardTitle>
          <CardDescription>Tell us about the pet you'd like a consultation for.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="petName">Pet's Name</Label>
              <Input id="petName" placeholder="Buddy" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Species</Label>
              <Select onValueChange={(v) => setValue('species', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.species && <p className="text-sm text-destructive">{errors.species.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" placeholder="e.g. Labrador, Persian" {...register('breed')} />
              {errors.breed && <p className="text-sm text-destructive">{errors.breed.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input id="age" type="number" min="0" {...register('age')} />
                {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" step="0.1" min="0.1" {...register('weight')} />
                {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Back</Button>
              <Button type="submit" className="flex-1">Choose a Time Slot</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
