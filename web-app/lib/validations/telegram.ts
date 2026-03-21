import { z } from "zod"

export const telegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z
    .object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        first_name: z.string(),
        username: z.string().optional(),
      }),
      chat: z.object({
        id: z.number(),
        type: z.string(),
      }),
      text: z.string().optional(),
    })
    .optional(),
})

export type TelegramUpdate = z.infer<typeof telegramUpdateSchema>
