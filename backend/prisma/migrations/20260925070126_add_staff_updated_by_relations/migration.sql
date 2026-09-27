-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "updatedByStaffId" INTEGER;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_updatedByStaffId_fkey" FOREIGN KEY ("updatedByStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
