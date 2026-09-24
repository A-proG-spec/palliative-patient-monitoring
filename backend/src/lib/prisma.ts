import { PrismaClient } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// Base client — no extensions.
// Used internally for restore / deleted-listing operations
// because Prisma's `$extends` middleware cannot see rows that
// are already filtered out by the extension itself.
// ─────────────────────────────────────────────────────────────
export const prismaBase = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['error'],
});

// ─────────────────────────────────────────────────────────────
// Extended client — auto-filters soft-deleted rows on reads.
// Every `findMany`/`findFirst`/`findUnique` on a model with a
// `deletedAt` column will implicitly add `deletedAt: null` unless
// the caller explicitly overrides it.
// ─────────────────────────────────────────────────────────────
export const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const SOFT_DELETE_MODELS = [
          'Staff',
          'Patient',
          'Medication',
          'LaboratoryTest',
          'ImagingOrder',
          'HomeVisit',
          'Referral',
          'HospitalAdmission',
          'DischargeSummary',
          'PatientProgressNote',
          'HospiceNursingAssessment',
          'ClinicalPharmacistAssessment',
          'PhysiotherapyAssessment',
          'FamilyAssessment',
          'NutritionalAssessment',
          'PainAssessment',
          'SocialAssessment',
          'SpiritualAssessment',
          'PsychiatryAssessment',
        ];

        const READ_OPS = [
          'findFirst',
          'findFirstOrThrow',
          'findMany',
          'findUnique',
          'findUniqueOrThrow',
          'count',
          'aggregate',
          'groupBy',
        ];

        if (
          model &&
          SOFT_DELETE_MODELS.includes(model) &&
          READ_OPS.includes(operation)
        ) {
          // Only add the filter if the caller hasn't already set it.
          const where = (args as any).where ?? {};
          if (where.deletedAt === undefined) {
            (args as any).where = { ...where, deletedAt: null };
          }
        }

        return query(args);
      },
    },
  },
});

export default prisma;