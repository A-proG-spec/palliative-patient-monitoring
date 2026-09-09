import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

// Animated pulse-line background
const PulseBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    <svg
      viewBox="0 0 1440 320"
      className="absolute bottom-0 w-full opacity-8 text-primary"
      fill="currentColor"
      preserveAspectRatio="none"
    >
      <path d="M0,160 C360,320 1080,0 1440,160 L1440,320 L0,320 Z" />
    </svg>
    {/* Decorative circles */}
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5" />
    <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/5" />
  </div>
);

const AuthLayout: React.FC = () => (
  <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-light via-background to-surface-low px-4 py-12">
    <PulseBackground />

    {/* Logo */}
    <Link to="/" className="relative z-10 flex items-center gap-2.5 mb-8 group">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md group-hover:shadow-lg transition-shadow">
        <Heart size={20} className="text-white" />
      </div>
      <span className="text-lg font-bold text-on-surface">{APP_NAME}</span>
    </Link>

    {/* Card */}
    <div className="relative z-10 w-full max-w-md">
      <Outlet />
    </div>

    {/* Footer */}
    <p className="relative z-10 mt-8 text-xs text-text-muted text-center">
      Yekatit 12 Hospital Medical College · Palliative Care Unit
    </p>
  </div>
);

export default AuthLayout;
