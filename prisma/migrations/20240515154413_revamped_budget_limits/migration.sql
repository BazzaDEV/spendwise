/*
  Warnings:

  - You are about to drop the `MonthlyBudgetLimit` table. If the table is not empty, all the data it contains will be lost.

*/

-- CreateTable
CREATE TABLE "BudgetLimit" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(65,30) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "timePeriodId" INTEGER NOT NULL,
    "budgetId" INTEGER,

    CONSTRAINT "BudgetLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimePeriod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TimePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimePeriod_name_key" ON "TimePeriod"("name");

-- Insert default time periods
INSERT INTO "TimePeriod" ("name") VALUES
('monthly'),
('yearly');

-- Migrate data from the old MonthlyBudgetLimit table to the new BudgetLimit table
INSERT INTO "BudgetLimit" ("date", "amount", "startDate", "endDate", "budgetId", "timePeriodId")
SELECT 
    "date", 
    "limit" AS "amount", 
    DATE_TRUNC('year', "date") AS "startDate",  -- Start date is January 1st of the year
    (DATE_TRUNC('year', "date") + INTERVAL '1 year' - INTERVAL '1 day') AS "endDate",  -- End date is December 31st of the year
    "budgetId", 
    (SELECT "id" FROM "TimePeriod" WHERE "name" = 'yearly') AS "timePeriodId"
FROM "MonthlyBudgetLimit";

-- AddForeignKey
ALTER TABLE "BudgetLimit" ADD CONSTRAINT "BudgetLimit_timePeriodId_fkey" FOREIGN KEY ("timePeriodId") REFERENCES "TimePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLimit" ADD CONSTRAINT "BudgetLimit_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "MonthlyBudgetLimit" DROP CONSTRAINT "MonthlyBudgetLimit_budgetId_fkey";

-- DropTable
DROP TABLE "MonthlyBudgetLimit";
