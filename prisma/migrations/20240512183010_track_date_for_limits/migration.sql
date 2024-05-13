/*
  Warnings:

  - You are about to drop the column `month` on the `MonthlyBudgetLimit` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `MonthlyBudgetLimit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MonthlyBudgetLimit" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
