import { z } from "zod"

// E.164 phone number: + followed by 1-15 digits
const e164Regex = /^\+[1-9]\d{1,14}$/

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone_number: z
    .string()
    .regex(e164Regex, "Phone must be in international format (e.g., +919876543210)")
    .optional()
    .or(z.literal("")),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
