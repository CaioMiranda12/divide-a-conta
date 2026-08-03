/*
  Warnings:

  - You are about to drop the column `user_id` on the `participants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bill_id,display_name]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `display_name` to the `participants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_user_id_fkey";

-- DropIndex
DROP INDEX "participants_bill_id_user_id_key";

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "user_id",
ADD COLUMN     "display_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "participants_bill_id_display_name_key" ON "participants"("bill_id", "display_name");
