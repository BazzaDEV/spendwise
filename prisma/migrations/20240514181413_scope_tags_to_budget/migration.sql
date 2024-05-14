-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "budgetId" INTEGER;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
