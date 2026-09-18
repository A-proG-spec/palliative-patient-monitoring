import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { APP_NAME } from '@/lib/config';

// Optional prop: refs to landing page sections for smooth-scroll links.
// Only provided when Navbar is rendered inside LandingPage.
export interface LandingSections {
  about:    React.RefObject<HTMLElement>;
  purpose:  React.RefObject<HTMLElement>;
  services: React.RefObject<HTMLElement>;
  outcomes: React.RefObject<HTMLElement>;
  stats:    React.RefObject<HTMLElement>;
}

interface NavbarProps {
  landingSections?: LandingSections;
}

const NAV_LINKS = [
  { label: 'About',            key: 'about'    },
  { label: 'Mission & Vision', key: 'purpose'  },
  { label: 'Care Service',     key: 'services' },
  { label: 'The Result',       key: 'outcomes' },
  { label: 'Statistics',       key: 'stats'    },
] as const;

export const Navbar: React.FC<NavbarProps> = ({ landingSections }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Elevate navbar background once user scrolls past the hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollToSection = useCallback(
    (key: keyof LandingSections) => {
      setMenuOpen(false);
      if (!landingSections) return;
      const el = landingSections[key].current;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [landingSections],
  );

  const showSectionLinks = Boolean(landingSections);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-lowest/95 backdrop-blur-md border-b border-border-base shadow-nav'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm group-hover:shadow-md transition-shadow">
            <Heart size={18} className="text-white" />
          </div>
          <span
            className={`text-base font-bold transition-colors ${
              scrolled ? 'text-on-surface' : 'text-white'
            }`}
          >
            {APP_NAME}
          </span>
        </Link>

        {/* ── Desktop section links (landing page only) ── */}
        {showSectionLinks && (
          <nav className="hidden md:flex items-center gap-6" aria-label="Page sections">
            {NAV_LINKS.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  scrolled ? 'text-on-surface' : 'text-white/90 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* ── Desktop actions ── */}
        <nav className="hidden md:flex items-center gap-2 flex-shrink-0" aria-label="Account actions">
          <ThemeToggle variant="dropdown" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className={!scrolled ? 'text-white hover:bg-white/10' : ''}
          >
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate('/register')}>
            Register as Staff
          </Button>
        </nav>

        {/* ── Mobile: theme toggle + hamburger ── */}
        <div className="flex md:hidden items-center gap-2 flex-shrink-0">
          <ThemeToggle variant="dropdown" />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              scrolled
                ? 'text-on-surface hover:bg-surface-low'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-border-base bg-surface-lowest/98 backdrop-blur-md"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {/* Section links — only on landing page */}
            {showSectionLinks && (
              <>
                {NAV_LINKS.map(({ label, key }) => (
                  <button
                    key={key}
                    onClick={() => scrollToSection(key)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-low hover:text-primary transition-colors"
                  >
                    {label}
                  </button>
                ))}
                <div className="my-2 border-t border-border-base" />
              </>
            )}

            {/* Auth actions */}
            <button
              onClick={() => { setMenuOpen(false); navigate('/login'); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-low transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setMenuOpen(false); navigate('/register'); }}
              className="w-full text-center mt-1 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors"
            >
              Register as Staff
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
