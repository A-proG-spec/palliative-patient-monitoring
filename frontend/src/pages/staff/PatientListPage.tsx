import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, MapPin, Calendar, Home, Hospital, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
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
import { useAuthStore } from '@/store/auth.store';
import { hasPermission, type StaffRole } from '@/config/permissions';

// ── Sort types ────────────────────────────────────────────────────
type SortField = 'name' | 'age' | 'registeredAt';
type SortDir = 'asc' | 'desc';

// ── Sort icon component ───────────────────────────────────────────
const SortIcon: React.FC<{ field: SortField; current: SortField; dir: SortDir }> = ({ field, current, dir }) => {
  if (field !== current) return <ArrowUpDown size={13} className="opacity-40" />;
  return dir === 'asc' ? <ArrowUp size={13} className="text-primary" /> : <ArrowDown size={13} className="text-primary" />;
};

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
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'Active' | 'Discharged' | undefined>(undefined);
  const [diagnosisFilter, setDiagnosisFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const limit = 12;

  const { data, isLoading, error, refetch } = usePatients({ page, limit, search: search || undefined, status });

  const userRole = (user?.role ?? '') as StaffRole;
  const canRegisterPatient = hasPermission(userRole, 'canRegisterPatient');

  // Collect unique diagnoses from current page for filter dropdown (no API change)
  const diagnoses = useMemo(() => {
    if (!data?.items) return [];
    const set = new Set(data.items.map((p) => p.primaryDiagnosis).filter(Boolean));
    return Array.from(set).sort();
  }, [data?.items]);

  // Client-side sort + diagnosis filter applied on top of server-paginated results
  const displayItems = useMemo(() => {
    let items = data?.items ?? [];

    // Diagnosis filter
    if (diagnosisFilter) {
      items = items.filter((p) => p.primaryDiagnosis === diagnosisFilter);
    }

    // Sort
    return [...items].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortField === 'age') {
        cmp = (a.age ?? 0) - (b.age ?? 0);
      } else {
        // registeredAt
        cmp = new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data?.items, sortField, sortDir, diagnosisFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

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
        {canRegisterPatient && (
          <Button leftIcon={<Plus size={15} />} onClick={() => navigate('/patients/new')}>
            Register Patient
          </Button>
        )}
      </div>

      {/* Search + Status + Diagnosis filters */}
      <div className="flex flex-wrap gap-3 items-center">
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
        {diagnoses.length > 0 && (
          <div className="relative flex items-center gap-1.5">
            <Filter size={14} className="text-text-muted absolute left-2.5 pointer-events-none" />
            <select
              value={diagnosisFilter}
              onChange={(e) => { setDiagnosisFilter(e.target.value); setPage(1); }}
              className="h-9 pl-8 pr-3 rounded-xl border border-border-base bg-surface-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              aria-label="Filter by diagnosis"
            >
              <option value="">All diagnoses</option>
              {diagnoses.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-1 text-xs text-text-muted">
        <span className="mr-1 font-medium">Sort by:</span>
        {(['name', 'age', 'registeredAt'] as SortField[]).map((field) => {
          const labels: Record<SortField, string> = { name: 'Name', age: 'Age', registeredAt: 'Date Registered' };
          return (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors ${
                sortField === field
                  ? 'bg-primary-light text-primary font-semibold'
                  : 'hover:bg-surface-low text-text-secondary'
              }`}
            >
              {labels[field]}
              <SortIcon field={field} current={sortField} dir={sortDir} />
            </button>
          );
        })}
        {diagnosisFilter && (
          <span className="ml-3 flex items-center gap-1 rounded-full bg-primary-light text-primary px-2.5 py-0.5 text-xs font-medium">
            <Filter size={10} />
            {diagnosisFilter}
            <button
              onClick={() => setDiagnosisFilter('')}
              className="ml-1 hover:text-primary/60"
              aria-label="Clear diagnosis filter"
            >
              ×
            </button>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !displayItems.length ? (
        <EmptyState
          icon={<User size={28} />}
          title="No patients found"
          description={search || diagnosisFilter ? 'Try a different search or filter.' : 'Register your first patient to get started.'}
          actionLabel={canRegisterPatient ? 'Register Patient' : undefined}
          onAction={canRegisterPatient ? () => navigate('/patients/new') : undefined}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => navigate(`/patients/${patient.id}`)}
              />
            ))}
          </div>
          <Pagination page={page} total={data!.total} limit={limit} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default PatientListPage;
