'use client'

import { Budget } from '@prisma/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export const BudgetsList = ({ budgets }: { budgets: Budget[] }) => {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-2">
      {budgets.map((budget) => (
        <Card
          key={budget.id}
          onClick={() => router.push(`/budgets/${budget.id}`)}
          className="transition-shadow hover:cursor-pointer hover:shadow-md"
        >
          <CardHeader>
            <CardTitle>{budget.name}</CardTitle>
          </CardHeader>
          {/* <CardContent> */}
          {/*   <p>Card Content</p> */}
          {/* </CardContent> */}
          {/* <CardFooter> */}
          {/*   <p>Card Footer</p> */}
          {/* </CardFooter> */}
        </Card>
      ))}
    </div>
  )
}
