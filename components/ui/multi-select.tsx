import {
  Dispatch,
  Ref,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from './command'
import { Badge } from './badge'
import { Button } from './button'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface MultiSelectOption {
  id?: string | number
  label: string
}

export interface MultiSelectProps {
  options?: MultiSelectOption[]
  value: MultiSelectOption[]
  onChange: (newValue: MultiSelectOption[]) => void
  onBlur?: () => void
  // ref: Ref<HTMLInputElement>
}

export function MultiSelect({
  options = [],
  value,
  onChange,
  onBlur,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  const searchInput =
    inputValue.trim().length > 0 ? inputValue.trim() : undefined

  const searchMatchesExistingOption = Boolean(
    options.find((o) => o.label === searchInput) ||
      value.find((s) => s.label === searchInput),
  )

  const selectables = options.filter(
    (o) => !value.some((v) => v.label === o.label),
  )

  function handleSelect(option: MultiSelectOption) {
    const updatedValue = [...value, option]
    onChange(updatedValue)
  }

  function handleUnselect(option: MultiSelectOption) {
    const updatedValue = value.filter((v) => v.label !== option.label)
    onChange(updatedValue)
  }

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (e.key === 'Enter' && searchInput && !searchMatchesExistingOption) {
          e.preventDefault()

          handleSelect({ label: searchInput })
          setInputValue('')

          setTimeout(() => input.focus(), 1)
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && value.length > 0) {
            handleUnselect(value.pop() as MultiSelectOption)
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === 'Escape') {
          input.blur()
        }
      }
    },
    [
      handleSelect,
      handleUnselect,
      value,
      searchInput,
      searchMatchesExistingOption,
    ],
  )

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="rounded-md border border-input bg-background px-3 py-2 text-sm">
        <div className="flex flex-wrap gap-1">
          {value.map((v) => (
            <Badge
              variant="secondary"
              key={v.label}
              className={cn('inline-flex select-none gap-1 whitespace-nowrap')}
            >
              {v.label}
              <Button
                className="h-fit rounded-full bg-transparent p-0.5 hover:bg-transparent"
                onClick={() => handleUnselect(v)}
              >
                <X className="h-3 w-3 text-primary" />
              </Button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select tags..."
            className="ml-1 flex-1 outline-none"
          />
        </div>
      </div>
      <div className="relative">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              {(!searchInput || searchMatchesExistingOption) && (
                <CommandEmpty>
                  <span>No results found.</span>
                </CommandEmpty>
              )}
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((s) => (
                  <CommandItem
                    key={s.label}
                    value={s.label}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={() => {
                      setInputValue('')
                      handleSelect(s)
                    }}
                  >
                    {s.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {searchInput && !searchMatchesExistingOption && (
                <CommandGroup>
                  <CommandItem value={searchInput}>
                    <span className="inline-flex items-center gap-2">
                      Create a new tag:
                      <Badge className={cn('inline-flex select-none gap-1')}>
                        {searchInput}
                      </Badge>
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  )
}
