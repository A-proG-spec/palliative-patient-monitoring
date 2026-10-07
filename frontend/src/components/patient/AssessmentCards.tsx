// src/components/patient/AssessmentCards.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ASSESSMENTS, type AssessmentDef } from '@/config/assessments';
import { hasPermission } from '@/config/permissions';
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
 * Rules:
 *   • Admins see every assessment (writable).
 *   • Anyone else sees every assessment they have a VIEW permission for.
 *     Cards they can also WRITE get an "Add" button on Active patients.
 */
export const AssessmentCards: React.FC<AssessmentCardsProps> = ({
  patientId,
  patientStatus,
  isAdmin = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role ?? null;
  const isAdminUser = isAdmin || user?.type === 'admin';

  // Which cards should render at all?
  const visibleDefs: AssessmentDef[] = isAdminUser
    ? Object.values(ASSESSMENTS)
    : Object.values(ASSESSMENTS).filter((def) =>
        hasPermission(role, def.viewPermission),
      );

  if (visibleDefs.length === 0) return null;

  const isWideView = isAdminUser || visibleDefs.length > 2;

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-primary" />
          <CardTitle>
            {isWideView ? 'Clinical Assessments' : 'Your Assessments'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleDefs.map((def) => {
            const canWriteThis =
              isAdminUser || hasPermission(role, def.writePermission);

            return (
              <div
                key={def.key}
                className="flex items-center gap-2 rounded-xl border border-border-base bg-surface-lowest p-3 hover:border-primary hover:shadow-md transition-all duration-150 group"
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `${patientPath(isAdminUser, patientId)}/${def.routeBase}`,
                    )
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
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-outline-variant flex-shrink-0 mt-1 group-hover:text-primary transition-colors"
                  />
                </button>

                {canWriteThis && patientStatus === 'Active' && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `${patientPath(isAdminUser, patientId)}/${def.routeBase}/new`,
                      )
                    }
                    aria-label={`Add ${def.label}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {patientStatus !== 'Active' && isAdminUser && (
          <p className="text-xs text-text-muted mt-3">
            Assessments are read-only for discharged patients.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentCards;