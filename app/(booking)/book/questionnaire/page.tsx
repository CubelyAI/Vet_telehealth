'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HEALTH_QUESTIONS } from '@/lib/booking-schema'
import { StepIndicator } from '@/components/booking/step-indicator'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BookStep4() {
  const router = useRouter()
  const [answers, setAnswers] = useState<string[]>(HEALTH_QUESTIONS.map(() => ''))
  const [errors, setErrors] = useState<boolean[]>(HEALTH_QUESTIONS.map(() => false))

  function handleAnswerChange(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setErrors((prev) => {
      const next = [...prev]
      next[index] = false
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors = answers.map((a) => a.trim() === '')
    setErrors(newErrors)
    if (newErrors.some(Boolean)) return

    const payload = HEALTH_QUESTIONS.map((question, i) => ({
      question,
      answer: answers[i].trim(),
    }))

    sessionStorage.setItem('booking_answers', JSON.stringify(payload))
    router.push('/book/payment')
  }

  return (
    <div>
      <StepIndicator currentStep={4} />
      <Card>
        <CardHeader>
          <CardTitle>Health Questionnaire</CardTitle>
          <CardDescription>Please answer all questions to help the vet prepare for your consultation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {HEALTH_QUESTIONS.map((question, i) => (
              <div key={i} className="space-y-2">
                <Label htmlFor={`q-${i}`} className="font-medium">
                  {i + 1}. {question}
                </Label>
                <Textarea
                  id={`q-${i}`}
                  placeholder="Your answer…"
                  value={answers[i]}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  className={errors[i] ? 'border-destructive' : ''}
                  rows={2}
                />
                {errors[i] && (
                  <p className="text-sm text-destructive">Please answer this question.</p>
                )}
              </div>
            ))}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Back</Button>
              <Button type="submit" className="flex-1">Continue to Payment</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
