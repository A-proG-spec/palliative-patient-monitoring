import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '@/components/common/Sidebar';
import { useDashboardStats } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/auth.store';

// Simple breadcrumb from pathname
const Breadcrumb: React.FC = () => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    // Skip raw IDs (MongoDB-like strings)
    if (/^[a-f0-9-]{8,}$/i.test(seg) || /^(pat|v|med|lab|ref|adm)-/.test(seg)) return null;
    return { href, label };
  }).filter(Boolean) as { href: string; label: string }[];

  if (crumbs.length <= 1) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-text-muted mb-4">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight size={12} className="text-outline-variant" />}
          {i === crumbs.length - 1 ? (
            <span className="text-on-surface-variant font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const DashboardLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { data: stats } = useDashboardStats();
  const location = useLocation();

  const pendingStaff = user?.type === 'admin' ? (stats?.pendingStaff ?? 0) : 0;
  const pendingReferrals = user?.type === 'admin' ? (stats?.pendingReferrals ?? 0) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar pendingStaff={pendingStaff} pendingReferrals={pendingReferrals} />

      {/* Main content — scrolls independently, sidebar stays fixed height */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <Breadcrumb />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
