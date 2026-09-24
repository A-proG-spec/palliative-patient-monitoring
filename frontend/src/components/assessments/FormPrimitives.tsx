import React from 'react';
import { cn } from '@/lib/utils';

export const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-surface-lowest border border-border-base rounded-2xl p-5 space-y-4">
    <h2 className="text-sm font-semibold text-primary uppercase tracking-wide border-b border-border-base pb-2">
      {title}
    </h2>
    {children}
  </div>
);

export const Grid: React.FC<{ cols?: 2 | 3 | 4; children: React.ReactNode }> = ({
  cols = 2,
  children,
}) => (
  <div
    className={cn('grid gap-4 grid-cols-1', {
      'sm:grid-cols-2': cols === 2,
      'sm:grid-cols-3': cols === 3,
      'sm:grid-cols-4': cols === 4,
    })}
  >
    {children}
  </div>
);

export const RadioGroup: React.FC<{
  label: string;
  name: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  required?: boolean;
}> = ({ label, name, value, options, onChange, required }) => (
  <div className="space-y-1.5">
    <p className="text-sm font-medium text-on-surface">
      {label}
      {required && <span className="text-error ml-0.5">*</span>}
    </p>
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-3.5 w-3.5 text-primary"
          />
          {o.label}
        </label>
      ))}
    </div>
  </div>
);

export const YesNo: React.FC<{
  label: string;
  name: string;
  value: string | undefined;
  onChange: (v: string) => void;
}> = ({ label, name, value, onChange }) => (
  <RadioGroup
    label={label}
    name={name}
    value={value}
    options={[
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
    ]}
    onChange={onChange}
  />
);

export const CheckboxGroup: React.FC<{
  label: string;
  values: string[];
  options: string[];
  onChange: (v: string[]) => void;
  cols?: 2 | 3;
}> = ({ label, values, options, onChange, cols = 2 }) => {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-on-surface">{label}</p>
      <div
        className={cn('grid gap-2 grid-cols-1', {
          'sm:grid-cols-2': cols === 2,
          'sm:grid-cols-3': cols === 3,
        })}
      >
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
            <input
              type="checkbox"
              checked={values.includes(o)}
              onChange={() => toggle(o)}
              className="h-3.5 w-3.5 rounded text-primary"
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
};