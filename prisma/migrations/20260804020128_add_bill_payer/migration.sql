-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "paid_by_participant_id" TEXT;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_paid_by_participant_id_fkey" FOREIGN KEY ("paid_by_participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
