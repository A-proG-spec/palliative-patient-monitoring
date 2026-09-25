import bcrypt from 'bcrypt';
import 'dotenv/config';
import {
  PrismaClient,
  StaffRole,
  StaffStatus,
  Sex,
  DiseaseStage,
  Prognosis,
  PatientStatus,
  CurrentLocation,
} from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Shared password hash
//
// Every seeded account uses this exact bcrypt hash, so all
// admin / staff accounts accept the same plaintext password.
// The hash was produced at cost factor 10 (matches
// BCRYPT_SALT_ROUNDS=10).
//
// Plaintext (for reference, do NOT commit to docs in prod):
//   "Password123"
// ─────────────────────────────────────────────────────────────
const SHARED_PASSWORD_HASH =
  '$2b$10$GdLYFYhSYuTCkdhdBqPXRe2QiWQ443kzC3p60xCUaDLdiOb5IHW6O';

// ─────────────────────────────────────────────────────────────
// Admin — same behaviour as before, but honours the hardcoded
// hash so admin + staff all share the same password.
// ─────────────────────────────────────────────────────────────
async function seedAdmin(): Promise<void> {
  const name = process.env.ADMIN_NAME ?? 'Admin User';
  const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase().trim();

  const existing = await prisma.admin.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    console.log(`ℹ️  Admin already exists: ${email} (id=${existing.id})`);
    return;
  }

  const admin = await prisma.admin.create({
    data: {
      name: name.trim(),
      email,
      password: SHARED_PASSWORD_HASH,
    },
  });

  console.log('✅ Seeded admin:');
  console.log(`   id:    ${admin.id}`);
  console.log(`   name:  ${admin.name}`);
  console.log(`   email: ${admin.email}`);
}

// ─────────────────────────────────────────────────────────────
// Staff — 12 users covering ALL StaffRole enum values
//
// All are created in `Active` state with verified email so they
// can log in immediately without admin approval.
//
// Roles covered:
//   ✅ Physician
//   ✅ Nurse
//   ✅ Pharmacist
//   ✅ Radiologist
//   ✅ LaboratoryTechnician
//   ✅ Physiologist      
//   ✅ Psychiatrist      
//   ✅ Psychologist      
//   ✅ SocialWorker      
//   ✅ SpiritualPerson   
// ─────────────────────────────────────────────────────────────
interface StaffSeed {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
}

const STAFF_SEEDS: StaffSeed[] = [
  // ── Physicians ──
  {
    name: 'Dr. Abebe Tesfaye',
    email: 'abebe.physician@y12hmc.et',
    phone: '+251911100001',
    role: 'Physician',
  },
  {
    name: 'Dr. Tigist Alemu',
    email: 'tigist.physician@y12hmc.et',
    phone: '+251911100002',
    role: 'Physician',
  },

  // ── Nurses ──
  {
    name: 'Selam Bekele',
    email: 'selam.nurse@y12hmc.et',
    phone: '+251911100003',
    role: 'Nurse',
  },
  {
    name: 'Meron Worku',
    email: 'meron.nurse@y12hmc.et',
    phone: '+251911100004',
    role: 'Nurse',
  },

  // ── Pharmacist ──
  {
    name: 'Dawit Girma',
    email: 'dawit.pharmacist@y12hmc.et',
    phone: '+251911100005',
    role: 'Pharmacist',
  },

  // ── Radiologist ──
  {
    name: 'Hanna Solomon',
    email: 'hanna.radiologist@y12hmc.et',
    phone: '+251911100006',
    role: 'Radiologist',
  },

  // ── Laboratory Technician ──
  {
    name: 'Yonas Kebede',
    email: 'yonas.labtech@y12hmc.et',
    phone: '+251911100007',
    role: 'LaboratoryTechnician',
  },

  // ── Physiologist (NEW) ──
  {
    name: 'Dr. Bereket Assefa',
    email: 'bereket.physiologist@y12hmc.et',
    phone: '+251911100008',
    role: 'Physiologist',
  },

  // ── Psychiatrist (NEW) ──
  {
    name: 'Dr. Rahel Tadesse',
    email: 'rahel.psychiatrist@y12hmc.et',
    phone: '+251911100009',
    role: 'Psychiatrist',
  },

  // ── Psychologist (NEW) ──
  {
    name: 'Dr. Samuel Getachew',
    email: 'samuel.psychologist@y12hmc.et',
    phone: '+251911100010',
    role: 'Psychologist',
  },

  // ── Social Worker (NEW) ──
  {
    name: 'Bethlehem Negash',
    email: 'bethlehem.socialworker@y12hmc.et',
    phone: '+251911100011',
    role: 'SocialWorker',
  },
  //nutritionist
  {
    name: 'Alemitu Bekele',
    email: 'alemitu.nutritionist@y12hmc.et',
    phone: '+251911100013',
    role: 'Nutritionist',
  },
  // ── Spiritual Person (NEW) ──
  {
    name: 'Father Yohannes Bekele',
    email: 'yohannes.spiritual@y12hmc.et',
    phone: '+251911100012',
    role: 'SpiritualPerson',
  },

];

async function seedStaff(): Promise<number[]> {
  const ids: number[] = [];

  for (const s of STAFF_SEEDS) {
    const email = s.email.toLowerCase().trim();

    const existing = await prisma.staff.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      console.log(`ℹ️  Staff already exists: ${email} (id=${existing.id})`);
      ids.push(existing.id);
      continue;
    }

    const staff = await prisma.staff.create({
      data: {
        name: s.name,
        email,
        phone: s.phone,
        password: SHARED_PASSWORD_HASH,
        role: s.role,
        status: StaffStatus.Active,
        isEmailVerified: true,
        // No OTP fields — verification is done
        emailVerificationOtp: null,
        emailVerificationOtpExpires: null,
        emailVerificationOtpAttempts: 0,
      },
    });

    console.log(`✅ Seeded staff: ${staff.name} <${staff.email}> (${staff.role})`);
    ids.push(staff.id);
  }

  return ids;
}

// ─────────────────────────────────────────────────────────────
// Patients — 10 realistic palliative care cases
//
// All registered by the first Physician in the seed set.
// ─────────────────────────────────────────────────────────────
interface PatientSeed {
  firstName: string;
  lastName: string;
  age: number;
  sex: Sex;
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverRelation?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: DiseaseStage;
  comorbidities: string[];
  estimatedPrognosis: Prognosis;
  status: PatientStatus;
  currentLocation: CurrentLocation;
  hospitalPatientId?: string;
}

const PATIENT_SEEDS: PatientSeed[] = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    age: 65,
    sex: Sex.Female,
    dateOfBirth: '1961-03-15',
    address: 'Bole Sub-city, Kebele 05, Addis Ababa',
    phone: '+251911001001',
    emergencyContactName: 'Michael Johnson',
    emergencyContactPhone: '+251911002002',
    caregiverName: 'Emily Johnson',
    caregiverPhone: '+251911003003',
    caregiverRelation: 'Daughter',
    primaryDiagnosis: 'Stage IV Breast Cancer',
    secondaryDiagnoses: ['Metastatic to bone', 'Anaemia'],
    diseaseStage: DiseaseStage.Advanced,
    comorbidities: ['Hypertension', 'Diabetes'],
    estimatedPrognosis: Prognosis.Months,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0001',
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    age: 72,
    sex: Sex.Male,
    dateOfBirth: '1954-06-20',
    address: 'Yeka Sub-city, Kebele 12, Addis Ababa',
    phone: '+251922001001',
    emergencyContactName: 'Linda Brown',
    emergencyContactPhone: '+251922002002',
    caregiverName: 'Robert Brown',
    caregiverPhone: '+251922003003',
    caregiverRelation: 'Son',
    primaryDiagnosis: 'Lung Cancer',
    secondaryDiagnoses: ['COPD'],
    diseaseStage: DiseaseStage.EndStage,
    comorbidities: ['COPD'],
    estimatedPrognosis: Prognosis.Weeks,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.ReferredHospital,
    hospitalPatientId: 'PAT-0002',
  },
  {
    firstName: 'Almaz',
    lastName: 'Tesfaye',
    age: 58,
    sex: Sex.Female,
    dateOfBirth: '1968-11-08',
    address: 'Kirkos Sub-city, Kebele 08, Addis Ababa',
    phone: '+251933001001',
    emergencyContactName: 'Tadesse Tesfaye',
    emergencyContactPhone: '+251933002002',
    caregiverName: 'Hiwot Tesfaye',
    caregiverPhone: '+251933003003',
    caregiverRelation: 'Sister',
    primaryDiagnosis: 'Cervical Cancer',
    secondaryDiagnoses: [],
    diseaseStage: DiseaseStage.Advanced,
    comorbidities: ['Anaemia'],
    estimatedPrognosis: Prognosis.Months,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0003',
  },
  {
    firstName: 'Bekele',
    lastName: 'Haile',
    age: 80,
    sex: Sex.Male,
    dateOfBirth: '1946-02-14',
    address: 'Arada Sub-city, Kebele 03, Addis Ababa',
    phone: '+251944001001',
    emergencyContactName: 'Abebe Haile',
    emergencyContactPhone: '+251944002002',
    caregiverName: 'Tigist Haile',
    caregiverPhone: '+251944003003',
    caregiverRelation: 'Daughter',
    primaryDiagnosis: 'Colorectal Cancer',
    secondaryDiagnoses: ['Liver metastasis'],
    diseaseStage: DiseaseStage.EndStage,
    comorbidities: ['Heart failure', 'Diabetes'],
    estimatedPrognosis: Prognosis.Days,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0004',
  },
  {
    firstName: 'Mekdes',
    lastName: 'Girma',
    age: 45,
    sex: Sex.Female,
    dateOfBirth: '1981-09-22',
    address: 'Nifas Silk Sub-city, Kebele 01, Addis Ababa',
    phone: '+251955001001',
    emergencyContactName: 'Girma Kebede',
    emergencyContactPhone: '+251955002002',
    caregiverName: 'Selamawit Girma',
    caregiverPhone: '+251955003003',
    caregiverRelation: 'Mother',
    primaryDiagnosis: 'Ovarian Cancer',
    secondaryDiagnoses: ['Ascites'],
    diseaseStage: DiseaseStage.Advanced,
    comorbidities: [],
    estimatedPrognosis: Prognosis.Months,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0005',
  },
  {
    firstName: 'Dawit',
    lastName: 'Kebede',
    age: 67,
    sex: Sex.Male,
    dateOfBirth: '1959-05-10',
    address: 'Lideta Sub-city, Kebele 07, Addis Ababa',
    phone: '+251966001001',
    emergencyContactName: 'Yeshi Kebede',
    emergencyContactPhone: '+251966002002',
    caregiverName: 'Birhan Kebede',
    caregiverPhone: '+251966003003',
    caregiverRelation: 'Wife',
    primaryDiagnosis: 'Prostate Cancer',
    secondaryDiagnoses: ['Bone metastasis'],
    diseaseStage: DiseaseStage.EndStage,
    comorbidities: ['Hypertension'],
    estimatedPrognosis: Prognosis.Weeks,
    status: PatientStatus.Discharged,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0006',
  },
  {
    firstName: 'Hana',
    lastName: 'Worku',
    age: 52,
    sex: Sex.Female,
    dateOfBirth: '1974-07-30',
    address: 'Gullele Sub-city, Kebele 09, Addis Ababa',
    phone: '+251977001001',
    emergencyContactName: 'Solomon Worku',
    emergencyContactPhone: '+251977002002',
    caregiverName: 'Meron Worku',
    caregiverPhone: '+251977003003',
    caregiverRelation: 'Daughter',
    primaryDiagnosis: 'Gastric Cancer',
    secondaryDiagnoses: ['Peritoneal carcinomatosis'],
    diseaseStage: DiseaseStage.Advanced,
    comorbidities: ['Malnutrition'],
    estimatedPrognosis: Prognosis.Months,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0007',
  },
  {
    firstName: 'Tesfaye',
    lastName: 'Mulugeta',
    age: 75,
    sex: Sex.Male,
    dateOfBirth: '1951-12-05',
    address: 'Akaki Sub-city, Kebele 04, Addis Ababa',
    phone: '+251988001001',
    emergencyContactName: 'Azeb Mulugeta',
    emergencyContactPhone: '+251988002002',
    caregiverName: 'Yonas Mulugeta',
    caregiverPhone: '+251988003003',
    caregiverRelation: 'Son',
    primaryDiagnosis: 'Hepatocellular Carcinoma',
    secondaryDiagnoses: [],
    diseaseStage: DiseaseStage.EndStage,
    comorbidities: ['Cirrhosis', 'Ascites'],
    estimatedPrognosis: Prognosis.Days,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0008',
  },
  {
    firstName: 'Liya',
    lastName: 'Solomon',
    age: 40,
    sex: Sex.Female,
    dateOfBirth: '1986-04-18',
    address: 'Bole Sub-city, Kebele 10, Addis Ababa',
    phone: '+251999001001',
    emergencyContactName: 'Daniel Solomon',
    emergencyContactPhone: '+251999002002',
    caregiverName: 'Ruth Solomon',
    caregiverPhone: '+251999003003',
    caregiverRelation: 'Sister',
    primaryDiagnosis: 'Glioblastoma (Brain Tumor)',
    secondaryDiagnoses: [],
    diseaseStage: DiseaseStage.Advanced,
    comorbidities: ['Epilepsy'],
    estimatedPrognosis: Prognosis.Months,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0009',
  },
  {
    firstName: 'Girma',
    lastName: 'Desta',
    age: 63,
    sex: Sex.Male,
    dateOfBirth: '1963-08-25',
    address: 'Kolfe Sub-city, Kebele 06, Addis Ababa',
    phone: '+251911101001',
    emergencyContactName: 'Senait Desta',
    emergencyContactPhone: '+251911102002',
    caregiverName: 'Kidist Desta',
    caregiverPhone: '+251911103003',
    caregiverRelation: 'Daughter',
    primaryDiagnosis: 'Oesophageal Cancer',
    secondaryDiagnoses: ['Dysphagia'],
    diseaseStage: DiseaseStage.EndStage,
    comorbidities: ['Severe malnutrition'],
    estimatedPrognosis: Prognosis.Weeks,
    status: PatientStatus.Active,
    currentLocation: CurrentLocation.Home,
    hospitalPatientId: 'PAT-0010',
  },
];

async function seedPatients(registeredById: number): Promise<void> {
  for (const p of PATIENT_SEEDS) {
    // Use the hospitalPatientId as a uniqueness key so re-running
    // the seed doesn't create duplicates.
    const existing = p.hospitalPatientId
      ? await prisma.patient.findFirst({
        where: { hospitalPatientId: p.hospitalPatientId },
        select: { id: true },
      })
      : null;

    if (existing) {
      console.log(
        `ℹ️  Patient already exists: ${p.firstName} ${p.lastName} (id=${existing.id})`,
      );
      continue;
    }

    const patient = await prisma.patient.create({
      data: {
        firstName: p.firstName,
        lastName: p.lastName,
        age: p.age,
        sex: p.sex,
        dateOfBirth: new Date(p.dateOfBirth),
        address: p.address,
        phone: p.phone,
        emergencyContactName: p.emergencyContactName,
        emergencyContactPhone: p.emergencyContactPhone,
        caregiverName: p.caregiverName,
        caregiverPhone: p.caregiverPhone,
        caregiverRelation: p.caregiverRelation ?? null,
        primaryDiagnosis: p.primaryDiagnosis,
        secondaryDiagnoses: p.secondaryDiagnoses,
        diseaseStage: p.diseaseStage,
        comorbidities: p.comorbidities,
        estimatedPrognosis: p.estimatedPrognosis,
        status: p.status,
        currentLocation: p.currentLocation,
        hospitalPatientId: p.hospitalPatientId ?? null,
        registeredBy: registeredById,
      },
    });

    console.log(
      `✅ Seeded patient: ${patient.firstName} ${patient.lastName} (${patient.hospitalPatientId})`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Entrypoint
// ─────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  try {
    console.log('🌱 Starting database seed...\n');

    await seedAdmin();
    console.log('');

    const staffIds = await seedStaff();
    console.log('');

    // Pick the first Physician ID as the "registered by" for all
    // patients. Fall back to the first staff id if for some reason
    // the Physician row is missing.
    const physicianId =
      staffIds[0] ?? (await prisma.staff.findFirst({ select: { id: true } }))?.id;

    if (!physicianId) {
      throw new Error('No staff available to register patients. Seed staff first.');
    }

    await seedPatients(physicianId);

    console.log('\n🎉 Seed complete.');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();