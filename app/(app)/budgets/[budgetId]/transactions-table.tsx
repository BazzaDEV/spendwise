'use client'

import { Tag, Transaction } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { deleteTransaction } from '@/api/transactions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { DataTable } from '@/components/ui/data-table'

type TransactionDetails = Transaction & { tags: Pick<Tag, 'id' | 'label'>[] }

export const columns: ColumnDef<TransactionDetails>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue<Date>('date')

      return format(new Date(date), 'yyyy/MM/dd')
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = row.getValue<Pick<Tag, 'id' | 'label'>[]>('tags')

      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              variant="secondary"
              key={tag.label}
              className={cn('inline-flex select-none gap-1 whitespace-nowrap')}
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)

      return <div className="text-right">{formatted}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const transaction = row.original

      async function handleDelete() {
        await deleteTransaction({ transactionId: transaction.id })
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/transactions/${transaction.id}/edit`}>
                <Pencil className="mr-1.5 size-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash className="mr-1.5 size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface TransactionTableProps<TData> {
  data: TData[]
}

export function TransactionsTable<TData, TValue>({
  data,
}: TransactionTableProps<TData>) {
  return (
    <DataTable
      columns={columns as ColumnDef<TData, TValue>[]}
      data={data}
    />
  )
}
