// src/components/common/Pagination.tsx

import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn, totalPages } from '@/lib/utils';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  total,
  limit,
  onPageChange,
  className,
}) => {
  const pages = totalPages(total, limit);

  if (pages <= 1) return null;

  // Show at most 5 page buttons around the current page
  const getPageNumbers = (): (number | '…')[] => {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    const result: (number | '…')[] = [];
    result.push(1);
    if (page > 3) result.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      result.push(i);
    }
    if (page < pages - 2) result.push('…');
    result.push(pages);
    return result;
  };

  return (
    <nav
      className={cn('flex items-center justify-between gap-2', className)}
      aria-label="Pagination"
    >
      <p className="text-body-sm text-text-secondary hidden sm:block">
        Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of{' '}
        {total}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </Button>

        {getPageNumbers().map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-text-muted select-none">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p as number)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className="min-w-[36px]"
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          aria-label="Next page"
        >
          ›
        </Button>
      </div>
    </nav>
  );
};
