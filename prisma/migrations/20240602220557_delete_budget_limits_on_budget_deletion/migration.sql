-- DropForeignKey
ALTER TABLE "BudgetLimit" DROP CONSTRAINT "BudgetLimit_budgetId_fkey";

-- AddForeignKey
ALTER TABLE "BudgetLimit" ADD CONSTRAINT "BudgetLimit_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
