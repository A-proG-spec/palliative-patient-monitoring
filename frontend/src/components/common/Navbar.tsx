import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { APP_NAME } from '@/lib/config';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-lowest/90 backdrop-blur-md border-b border-border-base shadow-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm group-hover:shadow-md transition-shadow">
            <Heart size={18} className="text-white" />
          </div>
          <span className="text-base font-bold text-on-surface">{APP_NAME}</span>
        </Link>

        {/* Nav actions */}
        <nav className="flex items-center gap-2">
          <ThemeToggle variant="dropdown" />
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate('/register')}>
            Register as Staff
          </Button>
        </nav>
      </div>
    </header>
  );
};
