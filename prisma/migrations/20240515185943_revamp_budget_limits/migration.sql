-- Create table for budget limits (to replace "MonthlyBudgetLimit")
CREATE TABLE "BudgetLimit" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "timePeriodId" INTEGER NOT NULL,
    "budgetId" INTEGER NOT NULL,

    CONSTRAINT "BudgetLimit_pkey" PRIMARY KEY ("id")
);

-- Create table for time periods 
CREATE TABLE "TimePeriod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TimePeriod_pkey" PRIMARY KEY ("id")
);

-- Create indices 
CREATE UNIQUE INDEX "BudgetLimit_budgetId_key" ON "BudgetLimit"("budgetId");
CREATE UNIQUE INDEX "TimePeriod_name_key" ON "TimePeriod"("name");

-- Insert default time periods
INSERT INTO "TimePeriod" ("name") VALUES
('monthly'),
('yearly');

-- Migrate data to new table
INSERT INTO "BudgetLimit" ("createdAt", "updatedAt", "amount", "timePeriodId", "budgetId")
SELECT 
    "date" AS "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt",
    "limit" AS "amount",
    (SELECT "id" FROM "TimePeriod" WHERE "name" = 'yearly') AS "timePeriodId",
    "budgetId"
FROM "MonthlyBudgetLimit";

-- Add foreign keys 
ALTER TABLE "BudgetLimit" ADD CONSTRAINT "BudgetLimit_timePeriodId_fkey" FOREIGN KEY ("timePeriodId") REFERENCES "TimePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BudgetLimit" ADD CONSTRAINT "BudgetLimit_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old foreign key and table 
ALTER TABLE "MonthlyBudgetLimit" DROP CONSTRAINT "MonthlyBudgetLimit_budgetId_fkey";
DROP TABLE "MonthlyBudgetLimit";

