/*
  Warnings:

  - You are about to drop the column `isSharedExpense` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `LocalUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reimbursement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LocalUser" DROP CONSTRAINT "LocalUser_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Reimbursement" DROP CONSTRAINT "Reimbursement_payerId_fkey";

-- DropForeignKey
ALTER TABLE "Reimbursement" DROP CONSTRAINT "Reimbursement_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Reimbursement" DROP CONSTRAINT "Reimbursement_transactionId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isSharedExpense";

-- DropTable
DROP TABLE "LocalUser";

-- DropTable
DROP TABLE "Reimbursement";
