// src/components/common/Footer.tsx
// Public footer used on landing/auth pages.

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-border-base py-6">
      <div className="max-w-container-xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-body-sm text-text-secondary text-center sm:text-left">
          © {new Date().getFullYear()} Palliative Care System. All rights reserved.
        </p>
        <p className="text-body-sm text-text-muted">
          Providing compassionate palliative care monitoring.
        </p>
      </div>
    </footer>
  );
};
