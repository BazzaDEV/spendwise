'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CurrencyInput } from '../ui/currency-input'
import { Prisma, Reimbursement as PrismaReimbursement } from '@prisma/client'
import { generateId } from 'lucia'
import { Trash } from 'lucide-react'

type Reimbursement = Pick<PrismaReimbursement, 'payerName' | 'note'> & {
  amount: number | string
  tempId: string
}

interface ReimbursementsProps {
  totalAmount: number | string
  onChange: (value: Reimbursement[]) => void
}

export default function ReimbursementsList({
  totalAmount,
  onChange,
}: ReimbursementsProps) {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [userShare, setUserShare] = useState<string | number>(0.0)

  // console.log(JSON.stringify(reimbursements, null, '\t'))

  function addReimbursement() {
    const newReimbursement: Reimbursement = {
      tempId: generateId(6),
      amount: 0,
      payerName: '',
      note: '',
    }

    const updated = [...reimbursements, newReimbursement]
    setReimbursements(updated)
    onChange(updated)
  }

  function deleteReimbursement(id: string) {
    const updated = reimbursements.filter((r) => r.tempId !== id)
    setReimbursements(updated)
    onChange(updated)
  }

  function updateReimbursement(reimbursement: Partial<Reimbursement>) {
    const updated = reimbursements.map((r) => {
      if (r.tempId === reimbursement.tempId) {
        return {
          ...r,
          ...reimbursement,
        }
      } else {
        return { ...r }
      }
    })

    setReimbursements(updated)
    onChange(updated)
  }

  function splitEvenly() {
    const n = reimbursements.length + 1
    const splitAmount = Number(totalAmount) / n

    setUserShare(splitAmount)

    const updated = reimbursements.map((r) => ({
      ...r,
      amount: splitAmount,
    }))
    setReimbursements(updated)
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xl font-medium tracking-tight">Reimbursements</span>
      <div className="inline-flex w-full justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          Your share:{' '}
          <CurrencyInput
            defaultValue={totalAmount}
            value={userShare}
            onValueChange={(value) =>
              !value ? setUserShare('') : setUserShare(value)
            }
            className="max-w-[100px]"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={splitEvenly}
        >
          Split Evenly
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {reimbursements.map((r) => (
          <div
            key={r.tempId}
            className="flex items-center gap-2"
          >
            <Input
              className="max-w-[200px]"
              placeholder="Name"
              onChange={(e) =>
                updateReimbursement({
                  tempId: r.tempId,
                  payerName: e.target.value,
                })
              }
            />
            <CurrencyInput
              className="max-w-[100px]"
              placeholder="Amount"
              value={r.amount}
              onValueChange={(value) =>
                updateReimbursement({
                  tempId: r.tempId,
                  amount: !value ? '' : value,
                })
              }
            />
            <Input
              className="w-full flex-1"
              placeholder="Notes"
              onChange={(e) =>
                updateReimbursement({
                  tempId: r.tempId,
                  note: e.target.value,
                })
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => deleteReimbursement(r.tempId)}
            >
              <Trash className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={addReimbursement}
      >
        + Add Reimbursement
      </Button>
    </div>
  )
}
