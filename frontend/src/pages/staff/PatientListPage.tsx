import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, MapPin, Calendar, Home, Hospital } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatients } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { Pagination } from '@/components/common/Pagination';
import { SkeletonCard } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { DISEASE_STAGE_LABELS } from '@/constants';
import type { Patient } from '@/types/patient.types';

// ── Patient card ──────────────────────────────────────────────────
const PatientCard: React.FC<{ patient: Patient; onClick: () => void }> = ({ patient, onClick }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
    <Card hover onClick={onClick} padding="md">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-sm">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface truncate">{patient.firstName} {patient.lastName}</p>
          <p className="text-xs text-text-muted font-mono">{patient.patientDisplayId}</p>
        </div>
        <StatusBadge status={patient.status} type="patient" />
      </div>

      <div className="space-y-1.5 text-xs text-text-secondary mb-3">
        <div className="flex items-center gap-1.5">
          <User size={11} className="text-text-muted" />
          <span>{patient.age} years · {patient.sex}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={11} className="text-text-muted" />
          <span className="truncate">{patient.primaryDiagnosis}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-text-muted" />
          <span>Registered {formatDate(patient.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary">{DISEASE_STAGE_LABELS[patient.diseaseStage] ?? patient.diseaseStage}</Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          {patient.currentLocation === 'ReferredHospital'
            ? <><Hospital size={11} /><span>Hospital</span></>
            : <><Home size={11} /><span>Home</span></>
          }
        </div>
      </div>
    </Card>
  </motion.div>
);

const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'Active' | 'Discharged' | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error, refetch } = usePatients({ page, limit, search: search || undefined, status });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/dashboard" label="Dashboard" />
          <h1 className="text-2xl font-bold text-on-surface">Patients</h1>
          <p className="text-sm text-text-secondary">
            {data ? `${data.total} patients registered` : 'Manage your patient list'}
          </p>
        </div>
        <Button leftIcon={<Plus size={15} />} onClick={() => navigate('/patients/new')}>
          Register Patient
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name, ID, or diagnosis…"
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-72"
        />
        <Select
          options={[{ value: 'Active', label: 'Active' }, { value: 'Discharged', label: 'Discharged' }]}
          placeholder="All statuses"
          value={status || ''}
          onChange={(e) => { setStatus(e.target.value as 'Active' | 'Discharged' | undefined || undefined); setPage(1); }}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.items?.length ? (
        <EmptyState
          icon={<User size={28} />}
          title="No patients found"
          description={search ? 'Try a different search term.' : 'Register your first patient to get started.'}
          actionLabel="Register Patient"
          onAction={() => navigate('/patients/new')}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => navigate(`/patients/${patient.id}`)}
              />
            ))}
          </div>
          <Pagination page={page} total={data.total} limit={limit} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default PatientListPage;
