-- DropForeignKey
ALTER TABLE "ClinicalPharmacistAssessment" DROP CONSTRAINT "ClinicalPharmacistAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "DischargeSummary" DROP CONSTRAINT "DischargeSummary_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "FamilyAssessment" DROP CONSTRAINT "FamilyAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "HomeVisit" DROP CONSTRAINT "HomeVisit_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "HospiceNursingAssessment" DROP CONSTRAINT "HospiceNursingAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "HospitalAdmission" DROP CONSTRAINT "HospitalAdmission_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ImagingOrder" DROP CONSTRAINT "ImagingOrder_orderedBy_fkey";

-- DropForeignKey
ALTER TABLE "LaboratoryTest" DROP CONSTRAINT "LaboratoryTest_orderedBy_fkey";

-- DropForeignKey
ALTER TABLE "NutritionalAssessment" DROP CONSTRAINT "NutritionalAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PainAssessment" DROP CONSTRAINT "PainAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_registeredBy_fkey";

-- DropForeignKey
ALTER TABLE "PatientProgressNote" DROP CONSTRAINT "PatientProgressNote_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PhysiotherapyAssessment" DROP CONSTRAINT "PhysiotherapyAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PsychiatryAssessment" DROP CONSTRAINT "PsychiatryAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_requestedBy_fkey";

-- DropForeignKey
ALTER TABLE "SocialAssessment" DROP CONSTRAINT "SocialAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "SpiritualAssessment" DROP CONSTRAINT "SpiritualAssessment_createdBy_fkey";

-- AlterTable
ALTER TABLE "ClinicalPharmacistAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DischargeSummary" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FamilyAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HomeVisit" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HospiceNursingAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HospitalAdmission" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ImagingOrder" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "orderedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LaboratoryTest" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "orderedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "createdByAdminId" INTEGER;

-- AlterTable
ALTER TABLE "NutritionalAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PainAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "registeredBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PatientProgressNote" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PhysiotherapyAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PsychiatryAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "requestedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SocialAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SpiritualAssessment" ADD COLUMN     "createdByAdminId" INTEGER,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_orderedBy_fkey" FOREIGN KEY ("orderedBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingOrder" ADD CONSTRAINT "ImagingOrder_orderedBy_fkey" FOREIGN KEY ("orderedBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingOrder" ADD CONSTRAINT "ImagingOrder_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalAdmission" ADD CONSTRAINT "HospitalAdmission_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalAdmission" ADD CONSTRAINT "HospitalAdmission_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPharmacistAssessment" ADD CONSTRAINT "ClinicalPharmacistAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPharmacistAssessment" ADD CONSTRAINT "ClinicalPharmacistAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysiotherapyAssessment" ADD CONSTRAINT "PhysiotherapyAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysiotherapyAssessment" ADD CONSTRAINT "PhysiotherapyAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyAssessment" ADD CONSTRAINT "FamilyAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyAssessment" ADD CONSTRAINT "FamilyAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalAssessment" ADD CONSTRAINT "NutritionalAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalAssessment" ADD CONSTRAINT "NutritionalAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAssessment" ADD CONSTRAINT "PainAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAssessment" ADD CONSTRAINT "PainAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAssessment" ADD CONSTRAINT "SocialAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAssessment" ADD CONSTRAINT "SocialAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpiritualAssessment" ADD CONSTRAINT "SpiritualAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpiritualAssessment" ADD CONSTRAINT "SpiritualAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychiatryAssessment" ADD CONSTRAINT "PsychiatryAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychiatryAssessment" ADD CONSTRAINT "PsychiatryAssessment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
