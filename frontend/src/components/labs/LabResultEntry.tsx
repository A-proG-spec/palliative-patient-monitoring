import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateLabResult } from '@/hooks/useLabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import type { LabCategory } from '@/types/lab.types';
import {
  updateLabResultSchema,
  type UpdateLabResultFormData,
} from '@/schemas/lab.schema';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface LabResultEntryProps {
  labId: string;
  patientId: string;
  category: LabCategory;
  onResultSaved?: () => void;
}

// Per-row abnormal flag options
const FLAG_OPTIONS = [
  { value: '', label: '— flag —' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Low', label: '⚠ Low' },
  { value: 'High', label: '⚠ High' },
  { value: 'Critical', label: '⚠ Critical' },
] as const;

type RowFlag = '' | 'Normal' | 'Low' | 'High' | 'Critical';

// ─────────────────────────────────────────────────────────────
// CBC panel schema — all fields optional (panel itself optional)
// ─────────────────────────────────────────────────────────────

const rowSchema = z.object({
  value: z.string().optional(),
  unit: z.string().optional(),
  refRange: z.string().optional(),
  flag: z.string().optional(),
});

const cbcSchema = z.object({
  // Header
  datePerformed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)')
    .min(1, 'Date performed is required'),
  performedBy: z.string().optional(),

  // CBC rows
  hemoglobin:    rowSchema,
  hematocrit:    rowSchema,
  rbcCount:      rowSchema,
  wbcCount:      rowSchema,
  plateletCount: rowSchema,
  mcv:           rowSchema,
  mch:           rowSchema,
  mchc:          rowSchema,
  rdw:           rowSchema,

  // Differential rows
  neutrophils:   z.object({ pct: z.string().optional(), abs: z.string().optional(), flag: z.string().optional() }),
  lymphocytes:   z.object({ pct: z.string().optional(), abs: z.string().optional(), flag: z.string().optional() }),
  monocytes:     z.object({ pct: z.string().optional(), abs: z.string().optional(), flag: z.string().optional() }),
  eosinophils:   z.object({ pct: z.string().optional(), abs: z.string().optional(), flag: z.string().optional() }),
  basophils:     z.object({ pct: z.string().optional(), abs: z.string().optional(), flag: z.string().optional() }),

  // Override / notes
  overallFlag: z.string().optional(),
  resultNotes: z.string().optional(),
});

type CbcFormData = z.infer<typeof cbcSchema>;

// ─────────────────────────────────────────────────────────────
// CBC row metadata
// ─────────────────────────────────────────────────────────────

const CBC_ROWS = [
  { key: 'hemoglobin',    label: 'Hemoglobin (Hb)',   unit: 'g/dL',       ref: '12.0–16.0' },
  { key: 'hematocrit',    label: 'Hematocrit (HCT)',  unit: '%',           ref: '37–47' },
  { key: 'rbcCount',      label: 'RBC Count',         unit: '×10⁶/µL',    ref: '4.2–5.4' },
  { key: 'wbcCount',      label: 'WBC Count',         unit: '×10³/µL',    ref: '4.0–11.0' },
  { key: 'plateletCount', label: 'Platelet Count',    unit: '×10³/µL',    ref: '150–400' },
  { key: 'mcv',           label: 'MCV',               unit: 'fL',         ref: '80–100' },
  { key: 'mch',           label: 'MCH',               unit: 'pg',         ref: '27–33' },
  { key: 'mchc',          label: 'MCHC',              unit: 'g/dL',       ref: '32–36' },
  { key: 'rdw',           label: 'RDW',               unit: '%',          ref: '11.5–14.5' },
] as const;

const DIFF_ROWS = [
  { key: 'neutrophils',  label: 'Neutrophils' },
  { key: 'lymphocytes',  label: 'Lymphocytes' },
  { key: 'monocytes',    label: 'Monocytes' },
  { key: 'eosinophils',  label: 'Eosinophils' },
  { key: 'basophils',    label: 'Basophils' },
] as const;

// ─────────────────────────────────────────────────────────────
// Serialization helpers
// ─────────────────────────────────────────────────────────────

/** Derives the most severe flag across all rows for the top-level abnormalFlag */
function deriveOverallFlag(data: CbcFormData): 'Normal' | 'Low' | 'High' | 'Critical' | undefined {
  const allFlags: RowFlag[] = [
    ...CBC_ROWS.map((r) => ((data[r.key as keyof Pick<CbcFormData, 'hemoglobin'|'hematocrit'|'rbcCount'|'wbcCount'|'plateletCount'|'mcv'|'mch'|'mchc'|'rdw'>])?.flag ?? '') as RowFlag),
    ...DIFF_ROWS.map((r) => ((data[r.key as keyof Pick<CbcFormData, 'neutrophils'|'lymphocytes'|'monocytes'|'eosinophils'|'basophils'>])?.flag ?? '') as RowFlag),
  ].filter(Boolean) as RowFlag[];

  if (!allFlags.length) return undefined;
  if (allFlags.includes('Critical')) return 'Critical';
  if (allFlags.includes('High'))     return 'High';
  if (allFlags.includes('Low'))      return 'Low';
  return 'Normal';
}

/** Prefixes a value string with a warning tag if the flag is abnormal */
function flagPrefix(flag: RowFlag | string | undefined, value: string): string {
  if (!flag || flag === 'Normal' || flag === '') return value;
  return `⚠ ${flag.toUpperCase()}  ${value}`;
}

/** Serializes all filled CBC rows into a multi-line result string */
function serializeCbc(data: CbcFormData): string {
  const lines: string[] = [];

  // CBC section
  const cbcLines: string[] = [];
  for (const row of CBC_ROWS) {
    const r = data[row.key as keyof Pick<CbcFormData, 'hemoglobin'|'hematocrit'|'rbcCount'|'wbcCount'|'plateletCount'|'mcv'|'mch'|'mchc'|'rdw'>];
    if (!r?.value?.trim()) continue;
    const unit     = r.unit?.trim()     || row.unit;
    const refRange = r.refRange?.trim() || row.ref;
    const valueStr = `${r.value.trim()} ${unit}`;
    const refStr   = `  [Ref: ${refRange}]`;
    cbcLines.push(`${row.label}: ${flagPrefix(r.flag as RowFlag, valueStr)}${refStr}`);
  }
  if (cbcLines.length) {
    lines.push('=== CBC (Complete Blood Count) ===', ...cbcLines);
  }

  // Differential section
  const diffLines: string[] = [];
  for (const row of DIFF_ROWS) {
    const r = data[row.key as keyof Pick<CbcFormData, 'neutrophils'|'lymphocytes'|'monocytes'|'eosinophils'|'basophils'>];
    const hasPct = r?.pct?.trim();
    const hasAbs = r?.abs?.trim();
    if (!hasPct && !hasAbs) continue;
    const pctStr = hasPct ? flagPrefix(r.flag as RowFlag, `${r.pct!.trim()} %`) : '';
    const absStr = hasAbs ? `  |  Abs: ${r.abs!.trim()} ×10³/µL` : '';
    diffLines.push(`${row.label}: ${pctStr}${absStr}`);
  }
  if (diffLines.length) {
    if (lines.length) lines.push('');
    lines.push('=== Differential Leukocyte Count ===', ...diffLines);
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

/** A single CBC analyte row: Value | Unit | Ref Range | Flag */
const CbcRow: React.FC<{
  label: string;
  defaultUnit: string;
  defaultRef: string;
  fieldPrefix: string;
  register: ReturnType<typeof useForm<CbcFormData>>['register'];
}> = ({ label, defaultUnit, defaultRef, fieldPrefix, register }) => (
  <tr>
    <td className="py-1.5 pr-3 text-sm text-text-muted whitespace-nowrap w-40">{label}</td>
    <td className="py-1.5 pr-2">
      <input
        type="text"
        placeholder="—"
        className="w-full rounded border border-border-base bg-surface px-2 py-1 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
        {...register(`${fieldPrefix}.value` as any)}
      />
    </td>
    <td className="py-1.5 pr-2 w-28">
      <input
        type="text"
        placeholder={defaultUnit}
        className="w-full rounded border border-border-base bg-surface px-2 py-1 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
        {...register(`${fieldPrefix}.unit` as any)}
      />
    </td>
    <td className="py-1.5 pr-2 w-28">
      <input
        type="text"
        placeholder={defaultRef}
        className="w-full rounded border border-border-base bg-surface px-2 py-1 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
        {...register(`${fieldPrefix}.refRange` as any)}
      />
    </td>
    <td className="py-1.5 w-28">
      <select
        className="w-full rounded border border-border-base bg-surface px-2 py-1 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
        {...register(`${fieldPrefix}.flag` as any)}
      >
        {FLAG_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </td>
  </tr>
);

/** A single differential row: % | Abs Count | Flag */
const DiffRow: React.FC<{
  label: string;
  fieldPrefix: string;
  register: ReturnType<typeof useForm<CbcFormData>>['register'];
}> = ({ label, fieldPrefix, register }) => (
  <tr>
    <td className="py-1.5 pr-3 text-sm text-text-muted whitespace-nowrap w-40">{label}</td>
    <td className="py-1.5 pr-2">
      <input
        type="text"
        placeholder="% —"
        className="w-full rounded border border-border-base bg-surface px-2 py-1 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
        {...register(`${fieldPrefix}.pct` as any)}
      />
    </td>
    <td className="py-1.5 pr-2">
      <input
        type="text"
        placeholder="Abs ×10³/µL —"
        className="w-full rounded border border-border-base bg-surface px-2 py-1 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
        {...register(`${fieldPrefix}.abs` as any)}
      />
    </td>
    <td className="py-1.5 w-28" colSpan={2}>
      <select
        className="w-full rounded border border-border-base bg-surface px-2 py-1 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
        {...register(`${fieldPrefix}.flag` as any)}
      >
        {FLAG_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </td>
  </tr>
);

// ─────────────────────────────────────────────────────────────
// CBC panel form
// ─────────────────────────────────────────────────────────────

const CbcPanel: React.FC<{
  labId: string;
  patientId: string;
  onResultSaved?: () => void;
}> = ({ labId, patientId, onResultSaved }) => {
  const updateMutation = useUpdateLabResult(patientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CbcFormData>({
    resolver: zodResolver(cbcSchema),
    defaultValues: {
      datePerformed: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: CbcFormData) => {
    const serialized = serializeCbc(data);

    if (!serialized.trim()) {
      // Nothing entered — keep form open, let native validation catch it
      return;
    }

    const overallFlag = data.overallFlag
      ? (data.overallFlag as UpdateLabResultFormData['abnormalFlag'])
      : (deriveOverallFlag(data) as UpdateLabResultFormData['abnormalFlag']);

    const payload: UpdateLabResultFormData = {
      datePerformed: data.datePerformed,
      result: serialized,
      abnormalFlag: overallFlag,
      resultNotes: data.resultNotes || undefined,
      performedBy: data.performedBy || undefined,
    };

    updateMutation.mutate(
      { labId, data: payload },
      { onSuccess: () => onResultSaved?.() },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Header row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Date Performed *"
          type="date"
          error={errors.datePerformed?.message}
          {...register('datePerformed')}
        />
        <Input
          label="Performed By (Optional)"
          placeholder="Technologist name"
          {...register('performedBy')}
        />
      </div>

      {/* CBC table */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
          Complete Blood Count (CBC)
        </p>
        <div className="overflow-x-auto rounded-lg border border-border-base">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-low text-xs text-text-muted uppercase tracking-wide">
                <th className="py-2 px-3 text-left font-semibold">Analyte</th>
                <th className="py-2 px-2 text-left font-semibold">Result</th>
                <th className="py-2 px-2 text-left font-semibold">Unit</th>
                <th className="py-2 px-2 text-left font-semibold">Ref Range</th>
                <th className="py-2 px-2 text-left font-semibold">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {CBC_ROWS.map((row) => (
                <CbcRow
                  key={row.key}
                  label={row.label}
                  defaultUnit={row.unit}
                  defaultRef={row.ref}
                  fieldPrefix={row.key}
                  register={register}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Differential table */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
          Differential Leukocyte Count
        </p>
        <div className="overflow-x-auto rounded-lg border border-border-base">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-low text-xs text-text-muted uppercase tracking-wide">
                <th className="py-2 px-3 text-left font-semibold">Cell Type</th>
                <th className="py-2 px-2 text-left font-semibold">Result (%)</th>
                <th className="py-2 px-2 text-left font-semibold">Absolute Count</th>
                <th className="py-2 px-2 text-left font-semibold" colSpan={2}>Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {DIFF_ROWS.map((row) => (
                <DiffRow
                  key={row.key}
                  label={row.label}
                  fieldPrefix={row.key}
                  register={register}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overall flag override + notes */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Overall Abnormal Flag
            <span className="ml-1 font-normal text-text-muted">(auto-derived; override if needed)</span>
          </label>
          <select
            className="w-full rounded-lg border border-border-base bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            {...register('overallFlag')}
          >
            {FLAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Textarea
        label="Additional Notes (Optional)"
        rows={2}
        placeholder="Any additional notes about the result..."
        {...register('resultNotes')}
      />

      <p className="text-xs text-text-muted">
        Only rows with a value entered will be included in the saved result. Empty rows are omitted.
      </p>

      <Button
        type="submit"
        loading={updateMutation.isPending}
        className="w-full"
      >
        {updateMutation.isPending ? 'Saving…' : 'Save CBC Results'}
      </Button>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// Generic fallback form (unchanged from original)
// ─────────────────────────────────────────────────────────────

const GenericPanel: React.FC<{
  labId: string;
  patientId: string;
  onResultSaved?: () => void;
}> = ({ labId, patientId, onResultSaved }) => {
  const updateMutation = useUpdateLabResult(patientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateLabResultFormData>({
    resolver: zodResolver(updateLabResultSchema),
    defaultValues: {
      datePerformed: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: UpdateLabResultFormData) => {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === '' || v === undefined || v === null) continue;
      cleaned[k] = v;
    }

    updateMutation.mutate(
      { labId, data: cleaned as UpdateLabResultFormData },
      { onSuccess: () => onResultSaved?.() },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Date Performed *"
          type="date"
          error={errors.datePerformed?.message}
          {...register('datePerformed')}
        />
        <Input
          label="Performed By (Optional)"
          placeholder="Technologist name"
          error={errors.performedBy?.message}
          {...register('performedBy')}
        />
      </div>

      <Textarea
        label="Result / Findings *"
        rows={4}
        placeholder="Enter the test results here..."
        error={errors.result?.message}
        {...register('result')}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Reference Range (Optional)"
          placeholder="e.g., 4.0–11.0 ×10³/μL"
          error={errors.referenceRange?.message}
          {...register('referenceRange')}
        />
        <Select
          label="Abnormal Flag (Optional)"
          options={[
            { value: 'Normal', label: 'Normal' },
            { value: 'Low', label: 'Low' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' },
          ]}
          placeholder="Select flag…"
          error={errors.abnormalFlag?.message}
          {...register('abnormalFlag')}
        />
      </div>

      <Textarea
        label="Additional Notes (Optional)"
        rows={2}
        placeholder="Any additional notes about the result..."
        error={errors.resultNotes?.message}
        {...register('resultNotes')}
      />

      <Button
        type="submit"
        loading={updateMutation.isPending}
        className="w-full"
      >
        {updateMutation.isPending ? 'Saving…' : 'Save Results'}
      </Button>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// Main export — routes to correct panel by category
// ─────────────────────────────────────────────────────────────

export const LabResultEntry: React.FC<LabResultEntryProps> = ({
  labId,
  patientId,
  category,
  onResultSaved,
}) => {
  return (
    <Card padding="lg" className="bg-surface-low">
      <CardContent>
        {category === 'Hematology' ? (
          <CbcPanel
            labId={labId}
            patientId={patientId}
            onResultSaved={onResultSaved}
          />
        ) : (
          <GenericPanel
            labId={labId}
            patientId={patientId}
            onResultSaved={onResultSaved}
          />
        )}
      </CardContent>
    </Card>
  );
};
