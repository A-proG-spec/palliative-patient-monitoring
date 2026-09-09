import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, User, Calendar, Bed, Stethoscope, Pill, Heart, Activity, AlertCircle, Users, Briefcase, Church, Phone, MapPin, UserCircle, ClipboardList, FileText, Building2 } from 'lucide-react';
import { updateAdmissionSchema, type UpdateAdmissionFormData } from '@/schemas/admission.schema';
import { useAdmissionDetail, useUpdateAdmission } from '@/hooks/useAdmissions';
import { usePatientVisits } from '@/hooks/useVisits';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatEnumLabel, cn } from '@/lib/utils';
import { DISEASE_STAGE_LABELS, SYMPTOM_LABELS } from '@/constants';

// ── Row component for detail display ─────────────────────────────
const Row: React.FC<{ label: string; value: string; icon?: React.ReactNode; fullWidth?: boolean }> = ({ 
  label, value, icon, fullWidth 
}) => (
  <div className={cn('flex items-start gap-2 py-1.5 border-b border-border-base last:border-0', fullWidth && 'col-span-2')}>
    {icon && <span className="text-text-muted mt-0.5 flex-shrink-0">{icon}</span>}
    <span className="text-text-muted text-sm min-w-[140px] flex-shrink-0">{label}:</span>
    <span className="text-on-surface text-sm font-medium">{value || '—'}</span>
  </div>
);

// ── Section header matching form style ───────────────────────────
const SectionHeader: React.FC<{ number: string; title: string; icon?: React.ReactNode }> = ({ number, title, icon }) => (
  <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-primary/30">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">{number}</span>
    <div className="flex items-center gap-2">
      {icon && <span className="text-primary">{icon}</span>}
      <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wide">{title}</h3>
    </div>
  </div>
);

// ── Care Plan Block ─────────────────────────────────────────────
const CarePlanBlock: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div>
    <p className="text-sm text-text-muted mb-1">{title}</p>
    <p className="text-sm text-on-surface bg-surface-low p-3 rounded-lg">{content || '—'}</p>
  </div>
);

// ── Checkbox display for form-like UI ────────────────────────────
const CheckboxDisplay: React.FC<{ checked: boolean; label: string }> = ({ checked, label }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 text-sm',
    checked ? 'text-success' : 'text-text-muted'
  )}>
    <span className={cn(
      'inline-flex h-4 w-4 items-center justify-center rounded border',
      checked ? 'bg-success border-success' : 'border-border-base'
    )}>
      {checked && <span className="text-white text-xs">✓</span>}
    </span>
    {label}
  </span>
);

const AdmissionDetailPage: React.FC = () => {
  const { id, admissionId } = useParams<{ id: string; admissionId: string }>();
  const navigate = useNavigate();
  
  // Get admission details
  const { data: adm, isLoading, error, refetch } = useAdmissionDetail(id!, admissionId!);
  
  // Get patient visits to get the latest PPS/KPS scores
  const { data: visitsData } = usePatientVisits(id!, { limit: 1 });
  
  const updateMutation = useUpdateAdmission(id!);
  const [showDischargeModal, setShowDischargeModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateAdmissionFormData>({
    resolver: zodResolver(updateAdmissionSchema),
    defaultValues: { 
      status: 'Discharged', 
      dischargeDate: new Date().toISOString().split('T')[0] 
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !adm) return <ErrorState onRetry={refetch} />;

  // Get the latest visit for PPS/KPS (per documentation: should come from last home visit)
  const latestVisit = visitsData?.items?.[0];
  const latestPPS = latestVisit?.ppsScore || adm.ppsScore || 0;
  const latestKPS = latestVisit?.kpsScore || adm.kpsScore || 0;

  const onDischarge = (data: UpdateAdmissionFormData) => {
    updateMutation.mutate(
      { admissionId: admissionId!, data },
      { onSuccess: () => { setShowDischargeModal(false); refetch(); } }
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* ── Form Header ── */}
      <div className="bg-primary-light border-l-4 border-primary p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
            <ClipboardList size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">PAIN & PALLIATIVE CARE WARD</h1>
            <p className="text-sm text-text-secondary">Patient Admission Form — Yekatit 12 Hospital Medical College (Y12HMC)</p>
          </div>
        </div>
        <div className="mt-2 text-sm text-text-muted">
          <span>Date: {formatDate(adm.admissionDate)}</span>
          <span className="mx-2">|</span>
          <span>Admission ID: {adm.id.slice(-8)}</span>
        </div>
      </div>

      {/* ── Header Actions ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div className="flex items-center gap-2">
          <StatusBadge status={adm.status} type="admission" />
          {adm.status === 'Active' && (
            <Button 
              variant="destructive" 
              size="sm" 
              leftIcon={<LogOut size={13} />} 
              onClick={() => setShowDischargeModal(true)}
            >
              Discharge
            </Button>
          )}
        </div>
      </div>

      {/* ── SECTION 1: PATIENT IDENTIFICATION DETAILS ── */}
      <Card padding="lg">
        <SectionHeader number="1" title="Patient Identification Details" icon={<User size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Patient Full Name" value={adm.patientName || '—'} icon={<UserCircle size={14} />} fullWidth />
          <Row label="Hospital ID / MRN" value={adm.hospitalPatientId || '—'} icon={<FileText size={14} />} />
          <Row label="Age" value={adm.age ? `${adm.age} years` : '—'} />
          <Row label="Sex" value={adm.sex || '—'} />
          <Row label="Date of Birth" value={adm.dateOfBirth ? formatDate(adm.dateOfBirth) : '—'} icon={<Calendar size={14} />} />
          <Row label="Address (Kebele/Sub-city)" value={adm.address || '—'} icon={<MapPin size={14} />} fullWidth />
          <Row label="Phone Number" value={adm.phone || '—'} icon={<Phone size={14} />} />
          <Row label="Emergency Contact Name" value={adm.emergencyContactName || '—'} />
          <Row label="Relationship" value={adm.emergencyContactRelationship || '—'} />
          <Row label="Emergency Contact Phone" value={adm.emergencyContactPhone || '—'} />
        </div>
      </Card>

      {/* ── SECTION 2: REFERRAL INFORMATION ── */}
      <Card padding="lg">
        <SectionHeader number="2" title="Referral Information" icon={<Building2 size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Referred From" value={adm.referredFrom || '—'} />
          <Row label="Referring Clinician" value={adm.referringClinician || '—'} />
          <Row label="Diagnosis at Referral" value={adm.primaryDiagnosis || '—'} fullWidth />
          <Row label="Reason for Referral" value={adm.referralReason || '—'} fullWidth />
          <Row label="Referral ID" value={adm.referralId || '—'} />
          <Row label="Status" value={adm.status} />
        </div>
      </Card>

      {/* ── SECTION 3: MEDICAL DIAGNOSIS ── */}
      <Card padding="lg">
        <SectionHeader number="3" title="Medical Diagnosis" icon={<Stethoscope size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Primary Diagnosis" value={adm.primaryDiagnosis} fullWidth />
          {adm.secondaryDiagnoses?.length > 0 && (
            <Row label="Secondary Diagnoses" value={adm.secondaryDiagnoses.join(', ')} fullWidth />
          )}
          <Row label="Stage of Disease" value={DISEASE_STAGE_LABELS[adm.diseaseStage] || adm.diseaseStage} />
          <Row label="Co-morbid Conditions" value={adm.comorbidities?.length ? adm.comorbidities.join(', ') : 'None'} fullWidth />
        </div>
      </Card>

      {/* ── SECTION 4: PALLIATIVE CARE ELIGIBILITY ── */}
      <Card padding="lg" className="border-l-4 border-l-success">
        <SectionHeader number="4" title="Palliative Care Eligibility" icon={<Heart size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Estimated Prognosis" value={adm.estimatedPrognosis} />
          <Row label="Palliative Performance Scale (PPS)" value={`${latestPPS}%`} />
          <Row label="Functional Status" value={formatEnumLabel(adm.functionalStatus)} />
          <Row label="Karnofsky Performance Scale (KPS)" value={`${latestKPS}`} />
          {latestVisit && (
            <Row label="From Last Visit" value={formatDate(latestVisit.visitDate)} fullWidth />
          )}
        </div>
        {!latestVisit && (
          <div className="mt-3 text-xs text-text-muted bg-warning-bg p-2 rounded-lg">
            ⚠ PPS/KPS scores from admission record (no home visit found)
          </div>
        )}
      </Card>

      {/* ── SECTION 5: PAIN & SYMPTOM ASSESSMENT (INITIAL) ── */}
      <Card padding="lg">
        <SectionHeader number="5" title="Pain & Symptom Assessment (Initial)" icon={<AlertCircle size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Current Pain Level" value={`${adm.painScore}/10`} />
          <Row label="Pain Type" value={formatEnumLabel(adm.painType)} />
          <Row label="Symptoms Present" value={adm.symptomsPresent?.length ? adm.symptomsPresent.join(', ') : 'None'} fullWidth />
        </div>
        {adm.symptomsPresent?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {adm.symptomsPresent.map((s) => (
              <Badge key={s} variant="warning">{SYMPTOM_LABELS[s] || s}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* ── SECTION 6: PSYCHOSOCIAL ASSESSMENT ── */}
      <Card padding="lg">
        <SectionHeader number="6" title="Psychosocial Assessment" icon={<Briefcase size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Emotional Status" value={formatEnumLabel(adm.emotionalStatus)} />
          <Row label="Family Support" value={formatEnumLabel(adm.familySupport)} />
          <Row label="Social Challenges" value={adm.socialChallenges || 'None'} fullWidth />
        </div>
      </Card>

      {/* ── SECTION 7: SPIRITUAL CARE NEEDS ── */}
      <Card padding="lg">
        <SectionHeader number="7" title="Spiritual Care Needs" icon={<Church size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Spiritual Concerns Identified" value={adm.spiritualConcerns ? 'Yes' : 'No'} />
          {adm.spiritualSupportPreferred && (
            <Row label="Preferred Spiritual Support" value={adm.spiritualSupportPreferred} />
          )}
          {adm.spiritualConcerns && adm.spiritualNeedsDescription && (
            <Row label="If Yes, specify" value={adm.spiritualNeedsDescription} fullWidth />
          )}
        </div>
      </Card>

      {/* ── SECTION 8: INITIAL CARE PLAN ── */}
      <Card padding="lg" className="border-l-4 border-l-primary">
        <SectionHeader number="8" title="Initial Care Plan" icon={<Pill size={16} />} />
        <div className="space-y-3">
          <CarePlanBlock title="Pain Management Plan" content={adm.painManagementPlan} />
          <CarePlanBlock title="Medication Plan" content={adm.medicationPlan} />
          <CarePlanBlock title="Nursing Care Plan" content={adm.nursingCarePlan} />
          
          {adm.psychosocialSupportPlan && (
            <CarePlanBlock title="Psychosocial Support Plan" content={adm.psychosocialSupportPlan} />
          )}
          
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-text-muted text-sm">Home-Based Care Required:</span>
              <CheckboxDisplay checked={adm.homeBasedCareRequired} label={adm.homeBasedCareRequired ? 'Yes' : 'No'} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-muted text-sm">Physiotherapy Required:</span>
              <CheckboxDisplay checked={adm.physiotherapyRequired} label={adm.physiotherapyRequired ? 'Yes' : 'No'} />
            </div>
          </div>
        </div>
      </Card>

      {/* ── SECTION 10: ADMISSION DECISION (skipping 9 as in form) ── */}
      <Card padding="lg">
        <SectionHeader number="10" title="Admission Decision" icon={<Bed size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Admitted to Hospice Unit" value={adm.status === 'Active' ? 'Yes' : 'No'} />
          <Row label="Admission Date" value={formatDate(adm.admissionDate)} />
          <Row label="Assigned Bed No" value={adm.bedNumber} />
          <Row label="Assigned Care Team" value={adm.careTeam} />
          <Row label="Status" value={adm.status} fullWidth />
        </div>
      </Card>

      {/* ── SECTION 11: STAFF SIGNATURES ── */}
      <Card padding="lg" className="bg-surface-low">
        <SectionHeader number="11" title="Staff Signatures" icon={<User size={16} />} />
        <div className="grid md:grid-cols-2 gap-x-6">
          <Row label="Admitting Physician" value={adm.admittingPhysician} />
          <Row label="Care Team" value={adm.careTeam} />
          <Row label="Signature" value={adm.createdBy?.name || '—'} />
          <Row label="Role" value={adm.createdBy?.role || '—'} />
          <Row label="Date" value={formatDate(adm.createdAt)} fullWidth />
        </div>
      </Card>

      {/* ── Discharge Information (if discharged) ── */}
      {adm.dischargeDate && (
        <Card padding="lg" className="border-l-4 border-l-text-muted">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-text-muted/30">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-text-muted text-white text-xs font-bold">D</span>
            <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wide">Discharge Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-x-6">
            <Row label="Discharge Date" value={formatDate(adm.dischargeDate)} />
            <Row label="Discharge Reason" value={adm.dischargeReason || '—'} />
          </div>
        </Card>
      )}

      {/* ── Discharge Modal ── */}
      {showDischargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md" padding="lg">
            <CardHeader>
              <CardTitle>Discharge Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-5">
                Are you sure you want to discharge this patient from admission?
              </p>
              <form onSubmit={handleSubmit(onDischarge)} className="space-y-4" noValidate>
                <Input 
                  label="Discharge Date" 
                  type="date" 
                  error={errors.dischargeDate?.message} 
                  {...register('dischargeDate')} 
                />
                <Select 
                  label="Discharge Reason" 
                  options={[
                    { value: 'Improved', label: 'Improved' }, 
                    { value: 'Deceased', label: 'Deceased' }
                  ]} 
                  error={errors.dischargeReason?.message} 
                  {...register('dischargeReason')} 
                />
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setShowDischargeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    loading={updateMutation.isPending}
                  >
                    Confirm Discharge
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdmissionDetailPage;