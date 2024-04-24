import { z } from 'zod'

export const newBudgetSchema = z.object({
  name: z.string().min(3),
  monthlyLimit: z.coerce.number().gt(0),
})

export type newBudgetSchema = z.infer<typeof newBudgetSchema>

export const newTransactionSchema = z.object({
  budgetId: z.number(),
  date: z.date(),
  description: z.string(),
  amount: z.coerce.number().min(0),
})

export type NewTransactionSchema = z.infer<typeof newTransactionSchema>
