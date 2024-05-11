-- CreateTable
CREATE TABLE "Reimbursements" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "payerId" TEXT,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "Reimbursements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reimbursements" ADD CONSTRAINT "Reimbursements_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursements" ADD CONSTRAINT "Reimbursements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
