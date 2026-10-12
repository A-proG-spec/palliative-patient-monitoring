/*
  Warnings:

  - The `breakthroughPainEpisodes` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `oxygenTherapy` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cough` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `feedingAssistance` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `enteralFeeding` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ivFluids` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `nauseaVomitingAffectingIntake` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `urinaryCatheter` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pressureInjury` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `woundCareProvided` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `counselingPsychologicalSupportProvided` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `spiritualDistressIdentified` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `spiritualCareProvided` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `spiritualReferralRequired` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `familyCaregiverPresent` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `familyMeetingHeld` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `goalsReviewedToday` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `changeInGoalsIdentified` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `advanceCarePlanReviewed` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currentMedicationRegimenReviewed` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `changesMade` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `prnBreakthroughMedicationUsed` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `prnEffectiveness` column on the `PatientProgressNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PatientProgressNote" DROP COLUMN "breakthroughPainEpisodes",
ADD COLUMN     "breakthroughPainEpisodes" "YesNo",
DROP COLUMN "oxygenTherapy",
ADD COLUMN     "oxygenTherapy" "YesNo",
DROP COLUMN "cough",
ADD COLUMN     "cough" "YesNo",
DROP COLUMN "feedingAssistance",
ADD COLUMN     "feedingAssistance" "YesNo",
DROP COLUMN "enteralFeeding",
ADD COLUMN     "enteralFeeding" "YesNo",
DROP COLUMN "ivFluids",
ADD COLUMN     "ivFluids" "YesNo",
DROP COLUMN "nauseaVomitingAffectingIntake",
ADD COLUMN     "nauseaVomitingAffectingIntake" "YesNo",
DROP COLUMN "urinaryCatheter",
ADD COLUMN     "urinaryCatheter" "YesNo",
DROP COLUMN "pressureInjury",
ADD COLUMN     "pressureInjury" "YesNo",
DROP COLUMN "woundCareProvided",
ADD COLUMN     "woundCareProvided" "YesNo",
DROP COLUMN "counselingPsychologicalSupportProvided",
ADD COLUMN     "counselingPsychologicalSupportProvided" "YesNo",
DROP COLUMN "spiritualDistressIdentified",
ADD COLUMN     "spiritualDistressIdentified" "YesNo",
DROP COLUMN "spiritualCareProvided",
ADD COLUMN     "spiritualCareProvided" "YesNo",
DROP COLUMN "spiritualReferralRequired",
ADD COLUMN     "spiritualReferralRequired" "YesNo",
DROP COLUMN "familyCaregiverPresent",
ADD COLUMN     "familyCaregiverPresent" "YesNo",
DROP COLUMN "familyMeetingHeld",
ADD COLUMN     "familyMeetingHeld" "YesNo",
DROP COLUMN "goalsReviewedToday",
ADD COLUMN     "goalsReviewedToday" "YesNo",
DROP COLUMN "changeInGoalsIdentified",
ADD COLUMN     "changeInGoalsIdentified" "YesNo",
DROP COLUMN "advanceCarePlanReviewed",
ADD COLUMN     "advanceCarePlanReviewed" "YesNo",
DROP COLUMN "currentMedicationRegimenReviewed",
ADD COLUMN     "currentMedicationRegimenReviewed" "YesNo",
DROP COLUMN "changesMade",
ADD COLUMN     "changesMade" "YesNo",
DROP COLUMN "prnBreakthroughMedicationUsed",
ADD COLUMN     "prnBreakthroughMedicationUsed" "YesNo",
DROP COLUMN "prnEffectiveness",
ADD COLUMN     "prnEffectiveness" "YesNo";
