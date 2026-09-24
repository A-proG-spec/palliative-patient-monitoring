import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  BarChart2,
  Printer,
  Hospital,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { getPatientDisplayId } from '@/lib/patientUtils';
import type { Patient } from '@/types/patient.types';

interface PatientHeaderProps {
  patient: Patient;
  showAddRecordButton: boolean;
  onAddRecord: () => void;
  onPrint: () => void;
  isPrinting: boolean;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  showAddRecordButton,
  onAddRecord,
  onPrint,
  isPrinting,
}) => {
  const navigate = useNavigate();

  const displayId = getPatientDisplayId({
    id: patient.id,
    hospitalPatientId: patient.hospitalPatientId,
  });
  const hasHospitalId = Boolean(patient.hospitalPatientId);

  return (
    <div className="flex items-start justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <BackButton to="/patients" label="Patients" />
        <div>
          {/* ID row — display ID + hospital MRN (when set) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-text-muted font-mono">
              {displayId}
            </span>
            {hasHospitalId && (
              <span className="text-[10px] font-mono text-text-muted bg-surface-low border border-border-base rounded px-1.5 py-0.5">
                MRN: {patient.hospitalPatientId}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-on-surface">
            {patient.firstName} {patient.lastName}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={patient.status} type="patient" />
        <StatusBadge status={patient.currentLocation} />

        {showAddRecordButton && (
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={onAddRecord}
          >
            Add Record
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          leftIcon={<FileText size={14} />}
          onClick={() => navigate(`/patients/${patient.id}/summary`)}
        >
          Summary
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<BarChart2 size={14} />}
          onClick={() => navigate(`/patients/${patient.id}/progress`)}
        >
          Progress
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Printer size={14} />}
          loading={isPrinting}
          onClick={onPrint}
        >
          Print History
        </Button>
      </div>
    </div>
  );
};

export default PatientHeader;