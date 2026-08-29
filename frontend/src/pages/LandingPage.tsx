// src/pages/LandingPage.tsx
// Route: /  |  Layout: PublicLayout (Navbar + Footer wraps this via PublicLayout)

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ROUTES } from '@/constants';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-20 max-w-container-xl mx-auto text-center">
          <div className="max-w-container-md mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary text-body-sm font-semibold mb-6">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Palliative Patient Monitoring System
            </div>
            <h1 className="text-hero-lg text-on-surface mb-6 leading-tight">
              Compassionate Care,{' '}
              <span className="text-primary">Coordinated Support</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-prose mx-auto">
              A comprehensive platform for palliative care teams to monitor
              patients, coordinate home visits, manage medications, and ensure
              holistic end-of-life care.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={ROUTES.LOGIN}>
                <Button variant="primary" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="outline" size="lg">
                  Register as Staff
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="px-6 py-16 bg-surface-container-low">
          <div className="max-w-container-xl mx-auto">
            <h2 className="text-heading-1 text-on-surface text-center mb-12">
              Built for Palliative Care Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-surface-container-lowest rounded-xl p-6 border border-border-base shadow-card"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={f.iconPath}
                      />
                    </svg>
                  </div>
                  <h3 className="text-card-title text-on-surface mb-2">
                    {f.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const FEATURES = [
  {
    title: 'Patient Registration',
    description:
      'Register palliative patients with full demographic and medical history, tracking their journey from admission to discharge.',
    iconPath:
      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    title: 'Home Visit Records',
    description:
      'Document comprehensive home visits including vitals, pain scores, functional assessments, and caregiver evaluations.',
    iconPath:
      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  },
  {
    title: 'Medication Management',
    description:
      'Order and track medications for patients at home or in hospital, with status updates from ordered to administered.',
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    title: 'Lab Test Tracking',
    description:
      'Order laboratory tests and record results, maintaining a complete diagnostic history for each patient.',
    iconPath:
      'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
  {
    title: 'Referral Workflow',
    description:
      'Manage patient referrals between facilities with admin approval workflow and status tracking.',
    iconPath:
      'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  {
    title: 'Staff Dashboard',
    description:
      'Real-time overview for care teams — assigned patients, upcoming visits, alerts, and pending tasks in one place.',
    iconPath:
      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];
