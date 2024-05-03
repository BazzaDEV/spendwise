-- DropForeignKey
ALTER TABLE "TagsOnTransactions" DROP CONSTRAINT "TagsOnTransactions_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnTransactions" DROP CONSTRAINT "TagsOnTransactions_transactionId_fkey";

-- AddForeignKey
ALTER TABLE "TagsOnTransactions" ADD CONSTRAINT "TagsOnTransactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnTransactions" ADD CONSTRAINT "TagsOnTransactions_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
