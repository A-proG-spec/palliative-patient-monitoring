import React from 'react';
import { Heart, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

const FooterHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface mb-3">
    {children}
  </h3>
);

const FooterMuted: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-text-secondary leading-relaxed">{children}</p>
);

export const Footer: React.FC = () => (
  <footer className="border-t border-border-base bg-surface-lowest">
    {/* Main grid */}
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand / Hospital Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={15} className="text-primary flex-shrink-0" />
            <span className="text-sm font-bold text-on-surface">{APP_NAME}</span>
          </div>
          <FooterHeading>Y12HMC</FooterHeading>
          <FooterMuted>
            Yekatit 12 Medical College provides compassionate palliative care,
            focusing on comfort, dignity, and peace for patients and their families.
          </FooterMuted>
        </div>

        {/* Contact Information */}
        <div>
          <FooterHeading>Contact Us</FooterHeading>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2 text-xs text-text-secondary">
              <MapPin size={13} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Yekatit 12 Medical College, Addis Ababa, Ethiopia</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-text-secondary">
              <Phone size={13} className="text-primary mt-0.5 flex-shrink-0" />
              <span>+251 11 123 4567</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-text-secondary">
              <Mail size={13} className="text-primary mt-0.5 flex-shrink-0" />
              <span>info@y12hmc.edu.et</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <FooterHeading>Quick Links</FooterHeading>
          <ul className="space-y-2">
            {[
              { label: 'About Us',         href: '/#about'    },
              { label: 'Mission & Vision', href: '/#purpose'  },
              { label: 'Care Services',    href: '/#services' },
              { label: 'Our Impact',       href: '/#stats'    },
              { label: 'Sign In',          href: '/login'     },
              { label: 'Register as Staff',href: '/register'  },
            ].map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
                >
                  <ExternalLink size={11} className="flex-shrink-0" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* About the System */}
        <div>
          <FooterHeading>Support</FooterHeading>
          <ul className="space-y-2">
            {[
              { label: 'Patient Resources', href: '#' },
              { label: 'Family Guide',      href: '#' },
              { label: 'FAQs',              href: '#' },
              { label: 'Privacy Policy',    href: '#' },
            ].map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
                >
                  <ExternalLink size={11} className="flex-shrink-0" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Privacy-first', 'Role-based access', 'Home-visit ready'].map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full border border-border-base bg-background px-2.5 py-0.5 text-xs text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Copyright bar */}
    <div className="border-t border-border-base bg-background">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <p className="text-xs text-text-muted">
          Built with clinical teams · Privacy-first records
        </p>
      </div>
    </div>
  </footer>
);
