import { z } from "zod"

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1, "Address is required"),
  radius: z.number().min(50).max(500).default(200),
})

export const createRouteSchema = z.object({
  name: z.string().min(1, "Route name is required").max(100),
  departure_location: locationSchema,
  destination_location: locationSchema,
  active_days: z
    .array(z.number().min(1).max(7))
    .min(1, "Select at least one active day"),
  expected_duration_mins: z
    .number()
    .min(5, "Minimum 5 minutes")
    .max(180, "Maximum 3 hours"),
  contact_ids: z.array(z.string().uuid()).optional(),
})

export type CreateRouteInput = z.infer<typeof createRouteSchema>
