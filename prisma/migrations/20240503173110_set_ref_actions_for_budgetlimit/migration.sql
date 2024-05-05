-- DropForeignKey
ALTER TABLE "MonthlyBudgetLimit" DROP CONSTRAINT "MonthlyBudgetLimit_budgetId_fkey";

-- AddForeignKey
ALTER TABLE "MonthlyBudgetLimit" ADD CONSTRAINT "MonthlyBudgetLimit_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
