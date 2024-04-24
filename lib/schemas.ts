import { z } from 'zod'

export const newBudgetSchema = z.object({
  name: z.string().min(3),
  monthlyLimit: z.coerce.number().gt(0),
})

export type newBudgetSchema = z.infer<typeof newBudgetSchema>
