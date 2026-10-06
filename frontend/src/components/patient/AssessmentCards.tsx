import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Eye, Plus } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';
import {
  ROLE_ASSESSMENTS,
  ASSESSMENTS,
  type AssessmentDef,
  type AssessmentKey,
} from '@/config/assessments';
import { useAuthStore } from '@/store/auth.store';
import { patientPath } from '@/lib/clinicalPaths';

interface AssessmentCardsProps {
  patientId: string;
  patientStatus: 'Active' | 'Discharged';
  isAdmin?: boolean;
}

/**
 * AssessmentCards
 * ───────────────
 * Renders one card per assessment the current user can interact with.
 *
 * Assessment access is derived from role. Nurses and physicians can view all
 * assessments and add pain assessments while the patient is active.
 *
 * The role is determined from the auth store; the config lives in
 * `src/config/assessments.ts`.
 */
export const AssessmentCards: React.FC<AssessmentCardsProps> = ({
  patientId,
  patientStatus,
  isAdmin = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role;
  const isAdminUser = isAdmin || user?.type === 'admin';

  if (!role && !isAdminUser) return null;

  // Which assessments does this role OWN?
  const owned = new Set<AssessmentKey>(ROLE_ASSESSMENTS[role] ?? []);

  // Physician / Nurse can view all assessments and write pain assessments.
  const isClinicianViewer =
    role === 'Physician' || role === 'Nurse';

  const visible: { def: AssessmentDef; canWrite: boolean }[] = isAdminUser
    ? Object.values(ASSESSMENTS).map((def) => ({ def, canWrite: true }))
    : isClinicianViewer
    ? Object.values(ASSESSMENTS).map((def) => ({
      def,
      canWrite: def.key === 'pain',
    }))
    : Array.from(owned).map((key) => ({
      def: ASSESSMENTS[key],
      canWrite: true,
    }));

  if (visible.length === 0) return null;

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-primary" />
          <CardTitle>
            {isClinicianViewer ? 'Clinical Assessments' : 'Your Assessments'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(({ def, canWrite }) => (
            <div
              key={def.key}
              className="
                flex items-center gap-2 rounded-xl border border-border-base
                bg-surface-lowest p-3
                hover:border-primary hover:shadow-md
                transition-all duration-150
                group
              "
            >
              <button
                type="button"
                onClick={() =>
                  navigate(`${patientPath(isAdminUser, patientId)}/${def.routeBase}`)
                }
                className="flex flex-1 min-w-0 items-start gap-3 text-left"
              >
                <span className="text-2xl flex-shrink-0 leading-none mt-0.5">
                  {def.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {def.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 leading-snug">
                    {def.description}
                  </p>
                  {!canWrite && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted mt-1">
                      <Eye size={10} />
                      Read-only
                    </span>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className="text-outline-variant flex-shrink-0 mt-1 group-hover:text-primary transition-colors"
                />
              </button>
              {(isAdminUser || (isClinicianViewer && def.key === 'pain')) && patientStatus === 'Active' && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`${patientPath(isAdminUser, patientId)}/${def.routeBase}/new`)
                  }
                  aria-label={`Add ${def.label}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  <Plus size={13} />
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentCards;