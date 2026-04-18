import { z } from 'zod'

export const CustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
})

export const PetSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  species: z.string().min(1, 'Please select a species'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.coerce.number().int().min(0, 'Age must be 0 or greater'),
  weight: z.coerce.number().positive('Weight must be greater than 0'),
})

export type CustomerData = z.infer<typeof CustomerSchema>
export type PetData = z.infer<typeof PetSchema>

export const SPECIES_OPTIONS = [
  'Dog',
  'Cat',
  'Rabbit',
  'Bird',
  'Guinea Pig',
  'Reptile',
  'Fish',
  'Other',
]

export const HEALTH_QUESTIONS = [
  'Is your pet currently on any medications? If yes, please list them.',
  'Has your pet had any recent surgeries or hospitalizations?',
  'Does your pet have any known allergies?',
  'Describe the main concern or reason for this consultation.',
  'Has your pet eaten and drunk normally in the past 24 hours?',
  'Have you noticed any changes in your pet\'s behaviour, energy, or appetite recently?',
]
