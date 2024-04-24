import NewBudgetForm from './new-budget-form'

export default function Page() {
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tighter">
        Create a new budget
      </h1>
      <NewBudgetForm />
    </div>
  )
}
