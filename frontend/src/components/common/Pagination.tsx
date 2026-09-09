import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ page, total, limit, onPageChange, className }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  const renderPage = (p: number, key: string | number) => (
    <button
      key={key}
      onClick={() => onPageChange(p)}
      className={cn(
        'h-8 min-w-[32px] rounded-lg px-2.5 text-sm font-medium transition-all duration-150',
        p === page
          ? 'bg-primary text-white shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-low'
      )}
    >
      {p}
    </button>
  );

  const result: React.ReactNode[] = [];
  let prev = 0;
  for (const p of visible) {
    if (p - prev > 1) result.push(<span key={`ellipsis-${p}`} className="px-1 text-text-muted">…</span>);
    result.push(renderPage(p, p));
    prev = p;
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-sm text-text-secondary">
        Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {result}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
