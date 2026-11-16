/* How a product change reads in the admin: "MRP ₹55,390 → ₹52,990". Shared
   by the bulk upload preview and each product's history. */

export type ChangeValue = string | number | boolean | null;

const FIELD_LABELS: Record<string, string> = {
  name: 'Title',
  status: 'Status',
  categorySlug: 'Category',
  brandName: 'Brand',
  priceInPaise: 'Selling price',
  mrpInPaise: 'MRP',
  inStock: 'In stock',
  description: 'Description',
  modelNumber: 'Model number',
  partNumber: 'Part number',
  ean: 'EAN',
  hsnCode: 'HSN code',
  gstRatePercent: 'GST',
  warranty: 'Warranty',
  inTheBox: 'In the box',
  photos: 'Photos',
  highlights: 'Key highlights',
  specs: 'Spec order',
  colours: 'Colours',
  sharedPhotos: 'Shared photos',
};

const STATUS_LABEL: Record<string, string> = { ACTIVE: 'On the shop', DRAFT: 'Draft', INACTIVE: 'Off the shop' };

export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

/** A spec is stored as "spec:<label>" and shown by its label. */
export const fieldLabel = (field: string) => (field.startsWith('spec:') ? field.slice(5) : (FIELD_LABELS[field] ?? field));

export function shownValue(field: string, value: ChangeValue): string {
  if (value === null || value === '') return '—';
  if (field.endsWith('InPaise')) return value === 0 ? '—' : rupees(Number(value));
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (field === 'status') return STATUS_LABEL[String(value)] ?? String(value);
  if (field === 'gstRatePercent') return `${value}%`;
  return String(value);
}
