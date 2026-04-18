import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { AppointmentStatus } from '@prisma/client'

export function statusVariant(status: AppointmentStatus): BadgeProps['variant'] {
  switch (status) {
    case 'CONFIRMED': return 'success'
    case 'PENDING': return 'warning'
    case 'COMPLETED': return 'info'
    case 'CANCELLED': return 'destructive'
    default: return 'outline'
  }
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={statusVariant(status)}>{status}</Badge>
}
