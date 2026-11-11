import { ImportMode, ParsedItem, StoredItem } from './sap-import.types';

/* Working out what an import would change, without changing anything.

   The same plan drives both the preview shown to the uploader and the write
   itself, so what they are shown is exactly what gets applied. Nothing here
   touches the database — it compares the sheet with what is already stored
   and returns the difference. */

/** The fields compared between the sheet and what is stored. */
const COMPARED = ['sapName', 'modelName', 'stock', 'mrpInPaise', 'mopInPaise', 'brand', 'partNumber', 'ean', 'itemGroup'] as const;
export type ComparedField = (typeof COMPARED)[number];

export interface FieldChange {
  field: ComparedField;
  from: string | number | null;
  to: string | number | null;
}

export interface ItemUpdate {
  item: ParsedItem;
  changes: FieldChange[];
  /** True if the code had dropped out of the feed and this sheet lists it
   *  again. */
  returning: boolean;
}

/** A selling-price move big enough to be worth a second look before it goes
 *  live — far more often a typo or a shifted column than a real change. */
export interface PriceAlert {
  sapCode: string;
  modelName: string;
  fromPaise: number;
  toPaise: number;
  percent: number;
}

export interface ImportPlan {
  toCreate: ParsedItem[];
  toUpdate: ItemUpdate[];
  unchanged: number;
  /** FULL mode only: codes that are stored and in the feed but absent from
   *  this sheet. They are marked out of stock, never deleted. */
  missing: { sapCode: string; modelName: string; stock: number }[];
  priceAlerts: PriceAlert[];
}

export const PRICE_ALERT_PERCENT = 40;

export function planImport(items: ParsedItem[], existing: StoredItem[], mode: ImportMode): ImportPlan {
  const stored = new Map(existing.map((item) => [item.sapCode.toLowerCase(), item]));
  const inSheet = new Set<string>();

  const plan: ImportPlan = { toCreate: [], toUpdate: [], unchanged: 0, missing: [], priceAlerts: [] };

  for (const item of items) {
    const key = item.sapCode.toLowerCase();
    inSheet.add(key);
    const current = stored.get(key);

    if (!current) {
      plan.toCreate.push(item);
      continue;
    }

    const changes: FieldChange[] = [];
    for (const field of COMPARED) {
      if (current[field] !== item[field]) changes.push({ field, from: current[field], to: item[field] });
    }
    const returning = !current.inLatestFeed;

    if (changes.length === 0 && !returning) {
      plan.unchanged++;
      continue;
    }
    plan.toUpdate.push({ item, changes, returning });

    if (current.mopInPaise > 0 && current.mopInPaise !== item.mopInPaise) {
      const percent = ((item.mopInPaise - current.mopInPaise) / current.mopInPaise) * 100;
      if (Math.abs(percent) >= PRICE_ALERT_PERCENT) {
        plan.priceAlerts.push({
          sapCode: item.sapCode,
          modelName: item.modelName,
          fromPaise: current.mopInPaise,
          toPaise: item.mopInPaise,
          percent: Math.round(percent),
        });
      }
    }
  }

  if (mode === 'full') {
    for (const current of existing) {
      if (current.inLatestFeed && !inSheet.has(current.sapCode.toLowerCase())) {
        plan.missing.push({ sapCode: current.sapCode, modelName: current.modelName, stock: current.stock });
      }
    }
  }

  return plan;
}

/** The catalogue is big enough for "most of it is missing" to mean
 *  something. Below this, a full import is allowed to remove freely. */
const MIN_CATALOGUE_FOR_REMOVAL_CHECK = 20;
const MAX_REMOVAL_SHARE = 0.5;

/** A FULL import that would take most of the catalogue out of stock is far
 *  more likely to be a partial sheet uploaded as a full one than a real
 *  clear-out. Returns the reason it needs explicit confirmation, or null. */
export function largeRemovalWarning(plan: ImportPlan, existing: StoredItem[]): string | null {
  const inFeed = existing.filter((item) => item.inLatestFeed).length;
  if (inFeed < MIN_CATALOGUE_FOR_REMOVAL_CHECK) return null;
  if (plan.missing.length / inFeed <= MAX_REMOVAL_SHARE) return null;
  return (
    `This sheet leaves out ${plan.missing.length} of the ${inFeed} products currently in the feed. ` +
    'Applying it as a full sheet would mark all of them out of stock. ' +
    'If the sheet only covers some products, apply it as a partial sheet instead.'
  );
}
