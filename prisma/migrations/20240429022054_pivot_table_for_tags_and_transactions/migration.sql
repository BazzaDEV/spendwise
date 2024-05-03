/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_transactionId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "transactionId";

-- CreateTable
CREATE TABLE "TagsOnTransactions" (
    "transactionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagsOnTransactions_pkey" PRIMARY KEY ("transactionId","tagId")
);

-- AddForeignKey
ALTER TABLE "TagsOnTransactions" ADD CONSTRAINT "TagsOnTransactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnTransactions" ADD CONSTRAINT "TagsOnTransactions_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
