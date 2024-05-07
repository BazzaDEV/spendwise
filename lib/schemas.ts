import { z } from 'zod'

export const newBudgetSchema = z.object({
  name: z.string().min(3),
  monthlyLimit: z.coerce.number().gt(0),
})

export type newBudgetSchema = z.infer<typeof newBudgetSchema>

export const newTransactionSchema = z.object({
  budgetId: z.number(),
  date: z.date(),
  tags: z.array(
    z.object({
      label: z.string().min(1),
      id: z.string().cuid().optional(),
    }),
  ),
  description: z.string(),
  amount: z.coerce.number().min(0),
  isSharedExpense: z.boolean().default(false).optional(),
  reimbursements: z.array(
    z.object({
      amount: z.coerce.number(),
      user: z.object({
        id: z.string().optional(),
        name: z.string().min(1),
      }),
    }),
  ),
})

export type NewTransactionSchema = z.infer<typeof newTransactionSchema>
