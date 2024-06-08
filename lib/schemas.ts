import { z } from 'zod'

export const newBudgetLimitSchema = z.object({
  periodId: z.coerce.number(),
  amount: z.union([z.number(), z.string().min(1)]),
})

export const newBudgetSchema = z.object({
  name: z.string().min(3),
  budgetLimit: newBudgetLimitSchema,
})

export type NewBudgetSchema = z.infer<typeof newBudgetSchema>

export const editBudgetLimitSchema = z.object({
  id: z.coerce.number(),
  timePeriodId: z.coerce.number(),
  amount: z.union([z.number(), z.string().min(1)]),
})

export type EditBudgetLimitSchema = z.infer<typeof editBudgetLimitSchema>

export const budgetSettingsSchema = newBudgetSchema.extend({
  id: z.coerce.number(),
  budgetLimit: editBudgetLimitSchema,
})

export type BudgetSettingsSchema = z.infer<typeof budgetSettingsSchema>

export const newReimbursementSchema = z.object({
  payerName: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().gt(0, 'Amount must be greater than $0'),
  note: z.string().optional(),
})

export type NewReimbursementSchema = z.infer<typeof newReimbursementSchema>

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
  amount: z.union([z.number(), z.string().min(1)]),
  reimbursements: z.array(newReimbursementSchema),
})

export type NewTransactionSchema = z.infer<typeof newTransactionSchema>

export const editReimbursementSchema = z.object({
  id: z.string().cuid().optional(),
  payerName: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().gt(0, 'Amount must be greater than $0'),
  note: z.string().optional(),
})

export type EditReimbursementSchema = z.infer<typeof editReimbursementSchema>

export const editTransactionSchema = z.object({
  id: z.string(),
  budgetId: z.coerce.number(),
  date: z.date(),
  tags: z.array(
    z.object({
      label: z.string().min(1),
      id: z.string().cuid().optional(),
    }),
  ),
  description: z.string().optional(),
  amount: z.union([z.number(), z.string().min(1)]),
  reimbursements: z.array(editReimbursementSchema),
})

export type EditTransactionSchema = z.infer<typeof editTransactionSchema>

export const updateTransactionSchema = editTransactionSchema.partial()

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>
