/*
  Warnings:

  - Made the column `payerName` on table `Reimbursement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reimbursement" ALTER COLUMN "payerName" SET NOT NULL;
