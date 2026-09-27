-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VisitTeamRole" ADD VALUE 'Pharmacist';
ALTER TYPE "VisitTeamRole" ADD VALUE 'Radiologist';
ALTER TYPE "VisitTeamRole" ADD VALUE 'LaboratoryTechnician';
ALTER TYPE "VisitTeamRole" ADD VALUE 'Physiologist';
ALTER TYPE "VisitTeamRole" ADD VALUE 'Psychiatrist';
ALTER TYPE "VisitTeamRole" ADD VALUE 'Psychologist';
ALTER TYPE "VisitTeamRole" ADD VALUE 'SocialWorker';
ALTER TYPE "VisitTeamRole" ADD VALUE 'SpiritualPerson';
ALTER TYPE "VisitTeamRole" ADD VALUE 'Nutritionist';
