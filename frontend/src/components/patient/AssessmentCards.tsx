import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Eye } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ROLE_ASSESSMENTS,
  ASSESSMENTS,
  type AssessmentDef,
  type AssessmentKey,
} from '@/config/assessments';
import { useAuthStore } from '@/store/auth.store';

interface AssessmentCardsProps {
  patientId: string;
}

/**
 * AssessmentCards
 * ───────────────
 * Renders one card per assessment the current user can interact with.
 *
 * Two modes:
 *   • OWNER role (e.g. Pharmacist sees Pharmacist Assessment)
 *       → clickable card, "Add New" flows available on the list page
 *   • VIEWER role (Physician/Nurse see all 8)
 *       → clickable card, "View only" badge, no Add New on the list page
 *
 * The role is determined from the auth store; the config lives in
 * `src/config/assessments.ts`.
 */
export const AssessmentCards: React.FC<AssessmentCardsProps> = ({
  patientId,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role;

  if (!role) return null;

  // Which assessments does this role OWN?
  const owned = new Set<AssessmentKey>(ROLE_ASSESSMENTS[role] ?? []);

  // Which assessments can this role VIEW?
  //   • Owners → their own
  //   • Physician / Nurse → all 8 (read-only)
  const isClinicianViewer =
    role === 'Physician' || role === 'Nurse';

  const visible: { def: AssessmentDef; canWrite: boolean }[] = isClinicianViewer
    ? Object.values(ASSESSMENTS).map((def) => ({ def, canWrite: false }))
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
          {isClinicianViewer && (
            <Badge variant="secondary" className="ml-1">
              <Eye size={11} className="mr-1" />
              View only
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(({ def, canWrite }) => (
            <button
              key={def.key}
              type="button"
              onClick={() =>
                navigate(`/patients/${patientId}/${def.routeBase}`)
              }
              className="
                flex items-start gap-3 rounded-xl border border-border-base
                bg-surface-lowest p-4 text-left
                hover:border-primary hover:shadow-md
                transition-all duration-150
                group
              "
            >
              <span className="text-2xl flex-shrink-0 leading-none mt-0.5">
                {def.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {def.label}
                  </p>
                </div>
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentCards;