import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Your Details' },
  { label: 'Pet Details' },
  { label: 'Choose Slot' },
  { label: 'Health Questions' },
  { label: 'Payment' },
]

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          return (
            <div key={step.label} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  isCompleted && 'bg-zinc-900 text-white',
                  isActive && 'bg-zinc-900 text-white ring-4 ring-zinc-200',
                  !isCompleted && !isActive && 'bg-zinc-200 text-zinc-500'
                )}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <span
                className={cn(
                  'mt-1 hidden text-xs sm:block',
                  isActive ? 'font-medium text-zinc-900' : 'text-zinc-400'
                )}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute mt-4 h-0.5 w-full',
                    isCompleted ? 'bg-zinc-900' : 'bg-zinc-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
