/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");
