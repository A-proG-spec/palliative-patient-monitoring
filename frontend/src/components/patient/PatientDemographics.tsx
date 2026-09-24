import React from 'react';
import {
  MapPin,
  Phone,
  Hospital,
  IdCard,
  UserCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { DISEASE_STAGE_LABELS } from '@/constants';
import { getPatientDisplayId } from '@/lib/patientUtils';
import type { Patient } from '@/types/patient.types';

// ── Small info row ──
const InfoRow: React.FC<{
  label: string;
  value: string;
  children?: React.ReactNode;
}> = ({ label, value, children }) => (
  <div>
    <span className="text-text-muted">{label}: </span>
    {children || <span className="text-on-surface">{value || '—'}</span>}
  </div>
);

interface PatientDemographicsProps {
  patient: Patient;
}

export const PatientDemographics: React.FC<PatientDemographicsProps> = ({
  patient,
}) => {
  const displayId = getPatientDisplayId({
    id: patient.id,
    hospitalPatientId: patient.hospitalPatientId,
  });
  const hasHospitalId = Boolean(patient.hospitalPatientId);

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* ── Patient Information ── */}
      <Card padding="md">
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold text-on-surface mb-3">
            Patient Information
          </h3>

          {/* ID block — display ID, hospital MRN, and registered-by */}
          <div className="rounded-lg bg-surface-low/50 border border-border-base px-3 py-2.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <IdCard size={13} className="text-text-muted flex-shrink-0" />
              <span className="text-xs text-text-muted">Patient ID:</span>
              <span className="text-xs font-mono font-medium text-on-surface">
                {displayId}
              </span>
            </div>

            {hasHospitalId && (
              <div className="flex items-center gap-2">
                <Hospital size={13} className="text-text-muted flex-shrink-0" />
                <span className="text-xs text-text-muted">Hospital MRN:</span>
                <span className="text-xs font-mono font-medium text-on-surface">
                  {patient.hospitalPatientId}
                </span>
              </div>
            )}

            {patient.registeredBy && (
              <div className="flex items-center gap-2">
                <UserCircle2
                  size={13}
                  className="text-text-muted flex-shrink-0"
                />
                <span className="text-xs text-text-muted">Registered by:</span>
                <span className="text-xs font-medium text-on-surface">
                  {typeof patient.registeredBy === 'string'
                    ? patient.registeredBy
                    : patient.registeredBy.name}
                </span>
              </div>
            )}
          </div>

          <InfoRow
            label="Age / Sex"
            value={`${patient.age} years · ${patient.sex}`}
          />
          <InfoRow
            label="Date of Birth"
            value={formatDate(patient.dateOfBirth)}
          />
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-text-muted flex-shrink-0" />
            <span className="text-text-secondary">{patient.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-text-muted flex-shrink-0" />
            <span className="text-text-secondary">{patient.phone}</span>
          </div>
          <InfoRow
            label="Emergency Contact"
            value={`${patient.emergencyContactName} · ${patient.emergencyContactPhone}`}
          />

          {/* Caregiver block */}
          <div className="rounded-lg bg-surface-low/50 border border-border-base px-3 py-2.5 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-xs text-text-muted min-w-[100px]">
                Caregiver:
              </span>
              <span className="text-xs font-medium text-on-surface flex-1">
                {patient.caregiverName || '—'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-text-muted min-w-[100px]">
                Relationship:
              </span>
              <span className="text-xs text-on-surface flex-1">
                {patient.caregiverRelation || '—'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-text-muted min-w-[100px]">
                Phone:
              </span>
              <span className="text-xs text-on-surface flex-1">
                {patient.caregiverPhone || '—'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Medical Information ── */}
      <Card padding="md">
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold text-on-surface mb-3">
            Medical Information
          </h3>
          <InfoRow
            label="Primary Diagnosis"
            value={patient.primaryDiagnosis}
          />
          {patient.secondaryDiagnoses?.length > 0 && (
            <InfoRow
              label="Secondary"
              value={patient.secondaryDiagnoses.join(', ')}
            />
          )}
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Stage:</span>
            <Badge variant="secondary">
              {DISEASE_STAGE_LABELS[patient.diseaseStage] ??
                patient.diseaseStage}
            </Badge>
          </div>
          <InfoRow label="Prognosis" value={patient.estimatedPrognosis} />
          {patient.comorbidities?.length > 0 && (
            <InfoRow
              label="Comorbidities"
              value={patient.comorbidities.join(', ')}
            />
          )}
          {patient.createdAt && (
            <InfoRow
              label="Registered"
              value={formatDate(patient.createdAt)}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default PatientDemographics;