-- DropForeignKey
ALTER TABLE "Medication" DROP CONSTRAINT "Medication_prescribedBy_fkey";

-- AlterTable
ALTER TABLE "Medication" ALTER COLUMN "prescribedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_prescribedBy_fkey" FOREIGN KEY ("prescribedBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
