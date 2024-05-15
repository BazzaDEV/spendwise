-- UpdateBudgetIds
UPDATE "Tag" AS t
SET "budgetId" = (
    SELECT "budgetId"
    FROM "Transaction" AS tr
    WHERE tr."id" = (
        SELECT "transactionId"
        FROM "TagOnTransaction" AS tot
        WHERE tot."tagId" = t."id"
        LIMIT 1
    )
);

