import { Schema, Query } from 'mongoose';

/**
 * Attaches soft-delete filtering middleware to a Mongoose schema.
 *
 * After calling this on a schema, every `find`, `findOne`, `findOneAndUpdate`,
 * `countDocuments`, and `aggregate` call automatically excludes documents
 * where `deletedAt` is not null — UNLESS the caller opts in with:
 *
 *   Model.find().setOptions({ includeDeleted: true })
 *
 * Uses async pre-hooks (Mongoose 8+ / 9 style) — do NOT use `next`.
 */
export function applySoftDeleteFilter(schema: Schema): void {
  // ── find / findOne / findOneAndUpdate / findOneAndDelete ──
  schema.pre(/^find/, async function (this: Query<any, any>) {
    const options: any = this.getOptions?.() ?? {};
    if (options.includeDeleted) {
      return;
    }

    const currentQuery = this.getQuery?.() ?? {};
    if (currentQuery.deletedAt === undefined) {
      this.where({ deletedAt: null });
    }
  });

  // ── countDocuments ──
  schema.pre('countDocuments', async function (this: Query<any, any>) {
    const options: any = this.getOptions?.() ?? {};
    if (options.includeDeleted) {
      return;
    }

    const currentFilter = this.getFilter?.() ?? {};
    if (currentFilter.deletedAt === undefined) {
      this.where({ deletedAt: null });
    }
  });

  // ── aggregate ──
  schema.pre('aggregate', async function (this: any) {
    const options = this.options ?? {};
    if (options.includeDeleted) {
      return;
    }

    // Prepend a $match stage filtering out deleted records
    this.pipeline().unshift({ $match: { deletedAt: null } });
  });
}

export default applySoftDeleteFilter;