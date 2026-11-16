import { ChangeValue } from './listing-rules';

/* A product's change history, read from the audit log: who did what, when,
   and which fields went from what to what. Kept apart from the database so
   it can be tested on its own. */

export interface AuditRow {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: unknown;
  createdAt: Date;
  actor: { name: string | null; email: string | null } | null;
}

export interface HistoryEntry {
  id: string;
  at: string;
  actor: string;
  title: string;
  /** A line under the title: where the change came from, or a note. */
  detail: string | null;
  changes: { field: string; from: ChangeValue; to: ChangeValue }[];
}

const STATUS_WORDS: Record<string, string> = { DRAFT: 'a draft', ACTIVE: 'on the shop', INACTIVE: 'off the shop' };

const record = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const text = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);
const changeValue = (value: unknown): ChangeValue =>
  value === null || value === undefined ? null : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : JSON.stringify(value);

function changesOf(metadata: Record<string, unknown>): HistoryEntry['changes'] {
  if (!Array.isArray(metadata.changes)) return [];
  return metadata.changes
    .map(record)
    .filter((c) => typeof c.field === 'string')
    .map((c) => ({ field: c.field as string, from: changeValue(c.from), to: changeValue(c.to) }));
}

/** One audit row as a line of the product's history. */
export function toHistoryEntry(row: AuditRow, slug: string): HistoryEntry {
  const meta = record(row.metadata);
  const file = text(meta.fileName);
  const viaSheet =
    meta.via === 'bulk upload'
      ? `From the bulk sheet “${file ?? 'unnamed'}”`
      : meta.via === 'title format'
        ? 'Rebuilt after its title format was changed'
        : null;
  const entry = (title: string, detail: string | null = null, changes: HistoryEntry['changes'] = []): HistoryEntry => ({
    id: row.id,
    at: row.createdAt.toISOString(),
    actor: row.actor ? (row.actor.name || row.actor.email || 'Unknown') : 'System',
    title,
    detail,
    changes,
  });
  const statusChange = () => (meta.from || meta.to ? [{ field: 'status', from: changeValue(meta.from), to: changeValue(meta.to) }] : []);

  switch (row.action) {
    case 'PRODUCT_CREATED':
      return entry(`Added as ${STATUS_WORDS[String(meta.status)] ?? 'a product'}`, viaSheet);
    case 'PRODUCT_UPDATED': {
      const changes = changesOf(meta);
      return entry(changes.length ? 'Edited' : 'Saved with no changes', viaSheet, changes);
    }
    case 'PRODUCT_ACTIVATED':
      return entry('Put on the shop', 'From the products list', statusChange());
    case 'PRODUCT_DEACTIVATED':
      return entry('Taken off the shop', 'From the products list', statusChange());
    case 'PRODUCT_DELETED':
      return entry('Deleted', 'Hidden from the shop and the products list. It can be restored.', statusChange());
    case 'PRODUCT_RESTORED': {
      const cleared = Array.isArray(meta.clearedBarcodes) ? meta.clearedBarcodes.map(String) : [];
      return entry(
        meta.status === 'DRAFT' ? 'Restored as a draft' : 'Restored, off the shop',
        cleared.length ? `Its EAN ${cleared.join(', ')} had since been given to another product, so ${cleared.length === 1 ? 'it was' : 'they were'} removed from this one.` : null,
      );
    }
    case 'SAP_ITEM_LINKED': {
      const colour = text(meta.colour);
      if (meta.productId === slug) {
        const moved = text(meta.previousProductId) && meta.previousProductId !== slug ? ` It was on ${meta.previousProductId} before.` : '';
        return entry(`Linked SAP code ${row.targetId}`, `${colour ? `For the colour ${colour}. ` : ''}Its price and stock now come from the SAP sheet.${moved}`.trim());
      }
      return entry(`SAP code ${row.targetId} moved to another product`, text(meta.productId) ? `Now on ${meta.productId}.` : null);
    }
    case 'SAP_ITEM_UNLINKED': {
      const colour = text(meta.previousColour);
      return entry(`Unlinked SAP code ${row.targetId}`, colour ? `It was the code for the colour ${colour}.` : null);
    }
    default:
      return entry(row.action.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()), viaSheet, changesOf(meta));
  }
}
