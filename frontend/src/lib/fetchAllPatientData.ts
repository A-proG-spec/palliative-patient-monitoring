/**
 * fetchAllPatientData
 * ───────────────────
 * Fetches EVERYTHING a patient has, at full detail level, so the
 * printed report can mirror the on-screen detail pages.
 *
 * Strategy per record type:
 *   1. Fetch the light list (one call)
 *   2. Extract every record id
 *   3. Fetch each record's detail endpoint in parallel
 *   4. Merge list + detail → full document
 *
 * Every per-record fetch is wrapped in `.catch(() => null)` so a
 * single 404 (e.g. a record deleted between the list and detail
 * calls) never kills the whole print job.
 *
 * NOTE ON HYDRATION:
 *   These list endpoints return the FULL document already, so no
 *   per-record hydration is needed:
 *     • medications  (Medication)
 *     • labs         (LaboratoryTest)
 *     • referrals    (Referral)
 *
 *   These list endpoints return LIGHT list-item shapes and MUST be
 *   hydrated with a per-record detail call:
 *     • visits           (HomeVisit)
 *     • progressNotes    (ProgressNote)
 *     • hospiceNursing   (HospiceNursingAssessment)
 *     • painAssessments  (PainAssessment)
 *     • pharmacist       (ClinicalPharmacistAssessment)
 *     • physiotherapy    (PhysiotherapyAssessment)
 *     • family           (FamilyAssessment)
 *     • nutritional      (NutritionalAssessment)
 *     • social           (SocialAssessment)
 *     • spiritual        (SpiritualAssessment)
 *     • psychiatry       (PsychiatryAssessment)
 *     • imaging          (ImagingOrder)
 *     • admissions       (HospitalAdmission)
 *
 * NOTE ON PAGINATION:
 *   Every list endpoint in this backend caps `limit` at 100 (see
 *   the Zod schemas in `backend/src/schemas/*.schema.ts`). Passing
 *   a larger value makes the backend return a 400 Validation error.
 *   Patients with more than 100 records of a single resource would
 *   need multi-page pagination — see the follow-up task to add a
 *   `fetchAllPages` helper if that ever becomes a real scenario.
 */

import type { QueryClient } from '@tanstack/react-query';

import { visitApi } from '@/api/visits';
import { progressNotesApi } from '@/api/progress-notes';
import { hospiceNursingApi } from '@/api/hospice-nursing';
import { painAssessmentApi } from '@/api/pain-assessment';
import { pharmacistAssessmentApi } from '@/api/pharmacist-assessment';
import { physiotherapyAssessmentApi } from '@/api/physiotherapy-assessment';
import { familyAssessmentApi } from '@/api/family-assessment';
import { nutritionalAssessmentApi } from '@/api/nutritional-assessment';
import { socialAssessmentApi } from '@/api/social-assessment';
import { spiritualAssessmentApi } from '@/api/spiritual-assessment';
import { psychiatryAssessmentApi } from '@/api/psychiatry-assessment';
import { medicationApi } from '@/api/medications';
import { labApi } from '@/api/labs';
import { imagingApi } from '@/api/imaging';
import { referralApi } from '@/api/referrals';
import { admissionApi } from '@/api/admissions';

// ── helper ───────────────────────────────────────────────────────

/**
 * Given a light list and a per-record detail fetcher, return the
 * list items merged with their detail data.
 *
 * If a detail fetch fails (404, 500, network error, etc.) the
 * corresponding list item is returned as-is — we never drop
 * records from the printed report.
 */
async function hydrateList<TListItem, TDetail>(
  list: TListItem[],
  getId: (item: TListItem) => string | number,
  fetchDetail: (id: string) => Promise<TDetail>,
): Promise<Array<TListItem & Partial<TDetail>>> {
  const details = await Promise.all(
    list.map((item) => fetchDetail(String(getId(item))).catch(() => null)),
  );

  return list.map((item, i) => ({
    ...item,
    ...(details[i] ?? {}),
  }));
}

// ── public API ───────────────────────────────────────────────────

export interface PatientDataBundle {
  visits: any[];
  progressNotes: any[];
  hospiceNursing: any[];
  painAssessments: any[];
  pharmacistAssessments: any[];
  physiotherapyAssessments: any[];
  familyAssessments: any[];
  nutritionalAssessments: any[];
  socialAssessments: any[];
  spiritualAssessments: any[];
  psychiatryAssessments: any[];
  medications: any[];
  labs: any[];
  imaging: any[];
  referrals: any[];
  admissions: any[];
}

export async function fetchAllPatientData(
  queryClient: QueryClient,
  patientId: string,
): Promise<PatientDataBundle> {
  // ═══════════════════════════════════════════════════════════
  // STEP 1 — Fetch every light list in parallel
  //
  // All `limit` values are 100, which is the hard maximum accepted
  // by every list endpoint in this backend. Anything larger fails
  // the Zod `.max(100)` check and returns a 400 Validation error.
  // ═══════════════════════════════════════════════════════════
  const [
    visitsList,
    progressNotesList,
    hospiceList,
    painList,
    pharmacistList,
    physioList,
    familyList,
    nutritionList,
    socialList,
    spiritualList,
    psychiatryList,
    medications,
    labs,
    imaging,
    referrals,
    admissions,
  ] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'visits'],
      queryFn: () => visitApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'progress-notes'],
      queryFn: () => progressNotesApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'hospice-nursing'],
      queryFn: () => hospiceNursingApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'pain'],
      queryFn: () => painAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'pharmacist'],
      queryFn: () =>
        pharmacistAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'physiotherapy'],
      queryFn: () =>
        physiotherapyAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'family'],
      queryFn: () =>
        familyAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'nutritional'],
      queryFn: () =>
        nutritionalAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'social'],
      queryFn: () =>
        socialAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'spiritual'],
      queryFn: () =>
        spiritualAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'psychiatry'],
      queryFn: () =>
        psychiatryAssessmentApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'medications'],
      queryFn: () => medicationApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'labs'],
      queryFn: () => labApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'imaging'],
      queryFn: () => imagingApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'referrals'],
      queryFn: () => referralApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['print', patientId, 'admissions'],
      queryFn: () => admissionApi.getByPatient(patientId, { limit: 100 }),
      staleTime: 0,
    }),
  ]);

  // ═══════════════════════════════════════════════════════════
  // STEP 2 — Hydrate each list with its per-record detail
  //
  // Medications, labs, and referrals are NOT hydrated here
  // because their list endpoints already return the full
  // document shape.
  // ═══════════════════════════════════════════════════════════
  const [
    visits,
    progressNotes,
    hospiceNursing,
    painAssessments,
    pharmacistAssessments,
    physiotherapyAssessments,
    familyAssessments,
    nutritionalAssessments,
    socialAssessments,
    spiritualAssessments,
    psychiatryAssessments,
    hydratedImaging,
    hydratedAdmissions,
  ] = await Promise.all([
    hydrateList(
      visitsList.items,
      (v: any) => v.id,
      (id) => visitApi.getById(patientId, id),
    ),
    hydrateList(
      progressNotesList.items,
      (n: any) => n.id,
      (id) => progressNotesApi.getById(patientId, id),
    ),
    hydrateList(
      hospiceList.items,
      (a: any) => a.id,
      (id) => hospiceNursingApi.getById(patientId, id),
    ),
    hydrateList(
      painList.items,
      (a: any) => a.id,
      (id) => painAssessmentApi.getById(patientId, id),
    ),
    hydrateList(
      pharmacistList.items,
      (a: any) => a.id,
      (id) => pharmacistAssessmentApi.getById(patientId, id),
    ),
    hydrateList(
      physioList.items,
      (a: any) => a.id,
      (id) => physiotherapyAssessmentApi.getById(patientId, id),
    ),
    hydrateList(
      familyList.items,
      (a: any) => a.id,
      (id) => familyAssessmentApi.getById(patientId, id),
    ),
    hydrateList(
      nutritionList.items,
      (a: any) => a.id,
      (id) => nutritionalAssessmentApi.getById(patientId, id),
    ),
    hydrateList(
      socialList.items,
      (a: any) => a.id,
      (id) => socialAssessmentApi.getById(patientId, id),
    ),
    hydrateList(
      spiritualList.items,
      (a: any) => a.id,
      (id) => spiritualAssessmentApi.getById(patientId, id),
    ),
    hydrateList(
      psychiatryList.items,
      (a: any) => a.id,
      (id) => psychiatryAssessmentApi.getById(patientId, id),
    ),
    // ── Hydrate imaging (list items → full ImagingOrder) ──
    hydrateList(
      imaging.items,
      (o: any) => o.id,
      (id) => imagingApi.getById(patientId, id),
    ),
    // ── Hydrate admissions (list items → full HospitalAdmission) ──
    hydrateList(
      admissions.items,
      (a: any) => a.id,
      (id) => admissionApi.getById(patientId, id),
    ),
  ]);

  // ═══════════════════════════════════════════════════════════
  // STEP 3 — Return the bundle
  // ═══════════════════════════════════════════════════════════
  return {
    visits,
    progressNotes,
    hospiceNursing,
    painAssessments,
    pharmacistAssessments,
    physiotherapyAssessments,
    familyAssessments,
    nutritionalAssessments,
    socialAssessments,
    spiritualAssessments,
    psychiatryAssessments,
    medications: medications.items,
    labs: labs.items,
    imaging: hydratedImaging,
    referrals: referrals.items,
    admissions: hydratedAdmissions,
  };
}