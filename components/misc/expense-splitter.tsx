'use client'

import { Button } from '@/components/ui/button'
import { Divide, Trash, UserRound, UserRoundPlus } from 'lucide-react'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Input } from '../ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getLocalUsers } from '@/api/users'
import { LocalUser } from '@prisma/client'
import { generateId } from 'lucia'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Share = {
  id: string
  user: User
  amount: number
}

type User = {
  id?: string
  name: string
}

type SplitType = {
  value: string
  label: string
}

const SPLIT_TYPES: SplitType[] = [
  {
    value: 'amount',
    label: 'Amount ($)',
  },
  {
    value: 'parts',
    label: 'Parts',
  },
]

interface ExpenseSplitterProps {
  amountToSplit: number
  onValueChange: (newValue: Share[]) => void
}

export default function ExpenseSplitter({
  amountToSplit,
  onValueChange,
}: ExpenseSplitterProps) {
  const [shares, setShares] = useState<Share[]>([])
  const [splitType, setSplitType] = useState<string>(SPLIT_TYPES[1].value)

  console.log(amountToSplit)

  function addShare(share: Share) {
    const updated = [...shares, share]
    setShares(updated)
    onValueChange(updated)
  }

  function removeShare(share: Share) {
    const updated = shares.filter((s) => s.id !== share.id)
    setShares(updated)
    onValueChange(updated)
  }

  function splitEvenly() {
    setSplitType('parts')
    const updated = shares.map((share) => ({ ...share, amount: 1 }))
    setShares(updated)
    onValueChange(updated)
  }

  function computeShareValue(share: Share) {
    const totalParts = shares.reduce((acc, curr) => acc + curr.amount, 0)
    const value = Number(amountToSplit) * (share.amount / totalParts)
    return value
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xl font-medium tracking-tight">Shares</span>
        <div className="inline-flex">
          <AddSharePopover
            addShare={addShare}
            removeShare={removeShare}
          />
          <Button
            className="inline-flex gap-1"
            variant="ghost"
            type="button"
            onClick={splitEvenly}
          >
            <Divide /> Split Evenly
          </Button>
          <Select
            value={splitType}
            onValueChange={setSplitType}
          >
            <SelectTrigger className="px-4">
              {SPLIT_TYPES.find((s) => s.value === splitType)?.label}
            </SelectTrigger>
            <SelectContent>
              {SPLIT_TYPES.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2 py-4">
        {shares && shares.length > 0 ? (
          shares.map((share) => (
            <div
              className="inline-flex items-center gap-2"
              key={share.id}
            >
              <span className="inline-flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback>{share.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{share.user.name}</span>
              </span>
              {splitType === 'parts' ? (
                <>
                  <span>{`'s share of`}</span>
                  <span className="font-semibold">{share.amount} part(s)</span>
                  <span>comes to a total of</span>
                  <span className="font-semibold">
                    {formatAmount(computeShareValue(share))}
                  </span>
                </>
              ) : (
                <>
                  <span>{`'s share comes to a total of`}</span>
                  <span className="font-semibold">
                    {formatAmount(share.amount)}
                  </span>
                </>
              )}
              <Button
                type="button"
                className="h-fit px-2"
                onClick={() => removeShare(share)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <span className="text-center text-sm text-muted-foreground">
            No shares created.
          </span>
        )}
      </div>
    </div>
  )
}

interface AddSharePopoverProps {
  addShare: (share: Share) => void
  removeShare: (share: Share) => void
}

const newShareSchema = z.object({
  user: z.object({
    id: z.string().min(1).optional(),
    name: z.string().min(1),
  }),
  amount: z.coerce.number(),
})

function AddSharePopover(props: AddSharePopoverProps) {
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<z.infer<typeof newShareSchema>>({
    resolver: zodResolver(newShareSchema),
    defaultValues: {
      amount: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof newShareSchema>) {
    console.log(values)
    props.addShare({ ...values, id: generateId(6) })
    form.reset()
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          className="inline-flex gap-1"
          variant="ghost"
          type="button"
        >
          <UserRoundPlus /> Add Share
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FindUserCombobox
                      value={field.value}
                      setValue={field.onChange}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="How much to split?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              onClick={form.handleSubmit(onSubmit)}
              type="button"
            >
              Add Share
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}

interface FindUserComboboxProps {
  value: LocalUser | { name: string } | null
  setValue: Dispatch<SetStateAction<LocalUser | { name: string } | null>>
}

function FindUserCombobox(props: FindUserComboboxProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [users, setUsers] = useState<LocalUser[] | null>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    async function getUsers() {
      const data = await getLocalUsers()
      if ('error' in data) {
        return
      }

      setUsers(data)
    }

    getUsers()
  }, [])

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
        >
          {props.value ? (
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" /> {props.value.name}
            </span>
          ) : (
            <span>+ Choose a user</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput
            value={inputValue}
            onValueChange={(v) => setInputValue(v)}
            placeholder="Search users..."
          />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users
                ? users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={(id) => {
                        props.setValue(users.find((u) => u.id === id) || null)
                        setOpen(false)
                      }}
                    >
                      <span>{user.name}</span>
                    </CommandItem>
                  ))
                : null}
              {inputValue.trim().length > 0 && (
                <CommandItem
                  value={inputValue}
                  onSelect={(name) => {
                    props.setValue({
                      name: name,
                    })
                    setOpen(false)
                  }}
                >
                  Create new user: {inputValue}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
