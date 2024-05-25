import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold tracking-tighter">
        Edit Transaction
      </h1>
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          {[0, 0, 0, 0, 0].map((_, index) => (
            <div
              key={index}
              className="space-y-2"
            >
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex w-full">
          <Button
            className="w-full"
            disabled
          >
            Save changes
          </Button>
          <Button
            disabled
            className="w-full"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
