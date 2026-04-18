import { v4 as uuidv4 } from 'uuid'

export function generateBookingToken(): string {
  return uuidv4()
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidBookingToken(token: string): boolean {
  return UUID_REGEX.test(token)
}

export function getConfirmationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${baseUrl}/confirmation/${token}`
}
