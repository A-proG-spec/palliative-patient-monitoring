/*
  Warnings:

  - You are about to drop the column `responsibleClinicianId` on the `PatientProgressNote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PatientProgressNote" DROP CONSTRAINT "PatientProgressNote_responsibleClinicianId_fkey";

-- DropIndex
DROP INDEX "PatientProgressNote_responsibleClinicianId_idx";

-- AlterTable
ALTER TABLE "PatientProgressNote" DROP COLUMN "responsibleClinicianId";
