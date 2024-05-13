-- DropForeignKey
ALTER TABLE "Reimbursement" DROP CONSTRAINT "Reimbursement_transactionId_fkey";

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
