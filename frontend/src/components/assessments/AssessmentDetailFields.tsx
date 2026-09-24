import React from 'react';

// ─────────────────────────────────────────────────────────────
// Field descriptor — one per displayable field on a detail page
// ─────────────────────────────────────────────────────────────

export interface FieldDef {
  label: string;
  key: string;
  /** Rendering style. */
  kind?: 'text' | 'chips' | 'boolean' | 'date' | 'json';
  /** Optional formatter for text values. */
  format?: (v: any) => string;
  /** Optional badge variant function. */
  badgeVariant?: (v: any) => 'default' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';
}

export interface DetailSectionDef {
  title: string;
  fields: FieldDef[];
}

// ─────────────────────────────────────────────────────────────
// Section renderer
// ─────────────────────────────────────────────────────────────

const prettify = (v: string) =>
  v.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

const ChipList: React.FC<{ values: string[] }> = ({ values }) => (
  <div className="flex flex-wrap gap-1.5 pt-1">
    {values.map((v) => (
      <span
        key={v}
        className="inline-block rounded-full bg-surface-low border border-border-base px-2.5 py-0.5 text-xs text-on-surface"
      >
        {prettify(v)}
      </span>
    ))}
  </div>
);

const Badge: React.FC<{
  value: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';
}> = ({ value, variant = 'default' }) => {
  const colors: Record<string, string> = {
    default: 'bg-surface-container text-text-secondary border-border-base',
    success: 'bg-success-bg text-success border-success/30',
    warning: 'bg-warning-bg text-warning border-warning/30',
    error: 'bg-error-bg text-error border-error/30',
    primary: 'bg-primary/10 text-primary border-primary/30',
    secondary: 'bg-surface-low text-text-secondary border-border-base',
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}
    >
      {prettify(value)}
    </span>
  );
};

const FieldRenderer: React.FC<{ field: FieldDef; value: any }> = ({
  field,
  value,
}) => {
  if (value === undefined || value === null || value === '') return null;

  const kind = field.kind ?? 'text';

  if (kind === 'chips') {
    const arr = Array.isArray(value) ? value : [value];
    if (arr.length === 0) return null;
    return (
      <div className="flex items-start gap-3 py-2 border-b border-border-base last:border-0">
        <span className="text-text-muted text-sm min-w-[200px] flex-shrink-0">
          {field.label}:
        </span>
        <ChipList values={arr} />
      </div>
    );
  }

  if (kind === 'boolean') {
    const on = value === true || value === 'Yes';
    return (
      <div className="flex items-start gap-3 py-1.5 border-b border-border-base last:border-0">
        <span className="text-text-muted text-sm min-w-[200px] flex-shrink-0">
          {field.label}:
        </span>
        <Badge value={on ? 'Yes' : 'No'} variant={on ? 'success' : 'default'} />
      </div>
    );
  }

  if (kind === 'date') {
    return (
      <div className="flex items-start gap-3 py-1.5 border-b border-border-base last:border-0">
        <span className="text-text-muted text-sm min-w-[200px] flex-shrink-0">
          {field.label}:
        </span>
        <span className="text-on-surface text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      </div>
    );
  }

  // text
  const text = field.format ? field.format(value) : prettify(String(value));
  const variant = field.badgeVariant ? field.badgeVariant(value) : undefined;

  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-border-base last:border-0">
      <span className="text-text-muted text-sm min-w-[200px] flex-shrink-0">
        {field.label}:
      </span>
      {variant ? (
        <Badge value={String(value)} variant={variant} />
      ) : (
        <span className="text-on-surface text-sm">{text}</span>
      )}
    </div>
  );
};

export const DetailSectionRenderer: React.FC<{
  section: DetailSectionDef;
  data: Record<string, any>;
}> = ({ section, data }) => {
  const visibleFields = section.fields.filter(
    (f) =>
      data[f.key] !== undefined &&
      data[f.key] !== null &&
      data[f.key] !== '' &&
      !(Array.isArray(data[f.key]) && data[f.key].length === 0),
  );
  if (visibleFields.length === 0) return null;

  return (
    <div className="bg-surface-lowest border border-border-base rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide border-b border-border-base pb-2 mb-3">
        {section.title}
      </h3>
      <div>
        {visibleFields.map((f) => (
          <FieldRenderer key={f.key} field={f} value={data[f.key]} />
        ))}
      </div>
    </div>
  );
};