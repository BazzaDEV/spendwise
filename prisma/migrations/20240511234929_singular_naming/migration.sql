/*
  Warnings:

  - You are about to drop the `Reimbursements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagsOnTransactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reimbursements" DROP CONSTRAINT "Reimbursements_payerId_fkey";

-- DropForeignKey
ALTER TABLE "Reimbursements" DROP CONSTRAINT "Reimbursements_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnTransactions" DROP CONSTRAINT "TagsOnTransactions_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnTransactions" DROP CONSTRAINT "TagsOnTransactions_transactionId_fkey";

-- DropTable
DROP TABLE "Reimbursements";

-- DropTable
DROP TABLE "TagsOnTransactions";

-- CreateTable
CREATE TABLE "Reimbursement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "payerId" TEXT,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagOnTransaction" (
    "transactionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagOnTransaction_pkey" PRIMARY KEY ("transactionId","tagId")
);

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnTransaction" ADD CONSTRAINT "TagOnTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnTransaction" ADD CONSTRAINT "TagOnTransaction_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
