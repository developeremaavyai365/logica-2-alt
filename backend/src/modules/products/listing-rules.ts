/* The rules of a product listing, apart from the database so they can be
   tested on their own: the spec fields each category asks for, barcode
   checks, the web address made from a title, and what a listing needs
   before it can go on the shop. Shared with the admin pages, so it imports
   nothing but the title rules, which are plain too. */

import { tidySize } from './title-format';

/** The variant's specs written one way: "8gb" as "8 GB". */
export function tidyVariantSpecs(categorySlug: string, specs: { label: string; value: string }[]) {
  const variant = new Set((SPEC_TEMPLATES[categorySlug] ?? []).filter((f) => f.variant).map((f) => f.label.toLowerCase()));
  return specs.map((s) => (variant.has(s.label.toLowerCase()) ? { ...s, value: tidySize(s.value) } : s));
}

export interface SpecField {
  label: string;
  /** Needed before the product can be published. */
  required: boolean;
  placeholder: string;
  /** Asked for with the variant, near the top of the form (RAM, storage). */
  variant?: boolean;
  /** The heading it is shown under in the form. */
  group?: string;
  /** Usual values, offered as suggestions; others can still be typed. */
  options?: string[];
}

const f = (label: string, placeholder: string, required = false, more: Partial<SpecField> = {}): SpecField => ({
  label,
  placeholder,
  required,
  ...more,
});
const YES_NO = ['Yes', 'No'];

/** Phone fields, after the marketplace listing sheet for mobiles: grouped
 *  as the form shows them, with the usual values offered. Labels the
 *  catalogue already uses are kept, so existing specs fill these fields. */
const PHONE_FIELDS: SpecField[] = [
  f('RAM', 'e.g. 8 GB', true, { variant: true }),
  f('Internal Storage', 'e.g. 256 GB', true, { variant: true }),
  ...[
    f('Network Type', 'e.g. 5G', false, { options: ['5G', '4G VoLTE', '4G', '3G', '2G'] }),
    f('Supported Network', 'e.g. 5G, 4G LTE, WCDMA, GSM'),
    f('SIM Type', 'e.g. Dual Sim', false, { options: ['Dual Sim', 'Single Sim'] }),
    f('SIM Size', 'e.g. Nano SIM', false, { options: ['Nano SIM', 'Nano SIM + eSIM', 'eSIM', 'Micro SIM', 'Full Size SIM'] }),
    f('Hybrid Sim Slot', 'Yes or No', false, { options: YES_NO }),
  ].map((x) => ({ ...x, group: 'Network & SIM' })),
  ...[
    f('Operating System', 'e.g. Android', true, { options: ['Android', 'iOS'] }),
    f('Operating System Version Name', 'e.g. Android 15 or iOS 18'),
    f('Operating System Version Number', 'e.g. 15'),
    f('Processor Brand', 'e.g. Qualcomm', false, { options: ['Qualcomm', 'MediaTek', 'Apple', 'Samsung Exynos', 'Google Tensor', 'Unisoc'] }),
    f('Processor', 'e.g. Snapdragon 8 Gen 3', true),
    f('Number of Cores', 'e.g. Octa Core', false, { options: ['Octa Core', 'Hexa Core', 'Quad Core'] }),
    f('Primary Clock Speed', 'e.g. 3.3 GHz'),
  ].map((x) => ({ ...x, group: 'Software & processor' })),
  ...[f('Display Size', 'e.g. 6.7 inch', true), f('Resolution', 'e.g. 2400 x 1080 pixels')].map((x) => ({ ...x, group: 'Display' })),
  ...[
    f('Primary Camera', 'e.g. 50 MP + 12 MP + 10 MP', true),
    f('Primary Camera Features', 'e.g. Night Mode, Portrait, 4K video'),
    f('Dual Camera Lens', 'Yes or No', false, { options: YES_NO }),
    f('Secondary Camera', 'e.g. 12 MP'),
    f('Secondary Camera Features', 'e.g. Fixed Focus, Portrait'),
  ].map((x) => ({ ...x, group: 'Cameras' })),
  ...[
    f('Battery Capacity', 'e.g. 5000 mAh', true),
    f('Memory Card Slot Type', 'e.g. Dedicated Slot', false, { options: ['Dedicated Slot', 'Hybrid Slot', 'No Slot'] }),
    f('OTG Compatible', 'Yes or No', false, { options: YES_NO }),
  ].map((x) => ({ ...x, group: 'Battery & memory' })),
  ...[
    f('Additional Content', 'Freebies in the box, e.g. Earphones'),
    f('Other Features', 'e.g. IP68 water resistance, Wireless charging'),
    f('Item Weight', 'e.g. 196 g'),
    f('Product Dimensions', 'e.g. 16.3 x 7.6 x 0.8 cm'),
  ].map((x) => ({ ...x, group: 'Other details' })),
];

/** The spec fields asked for per category, in the order the product page
 *  shows them. Labels follow the ones the catalogue already uses most.
 *  Categories without an entry take free-form specs. */
export const SPEC_TEMPLATES: Record<string, SpecField[]> = {
  laptops: [
    f('Processor', 'e.g. 13th Gen Intel Core i5-1335U', true),
    f('RAM', 'e.g. 16 GB DDR4', true, { variant: true }),
    f('Storage', 'e.g. 512 GB SSD', true, { variant: true }),
    f('Screen Size', 'e.g. 39.6 cm (15.6 inch)', true),
    f('Screen Resolution', 'e.g. 1920 x 1080 (Full HD)'),
    f('Graphics', 'e.g. Intel Iris Xe'),
    f('Operating System', 'e.g. Windows 11 Home', true),
    f('Battery', 'e.g. 3-cell, 41 Wh'),
    f('Item Weight', 'e.g. 1.6 kg'),
    f('Colour', 'e.g. Natural Silver'),
  ],
  'mobile-phones': PHONE_FIELDS,
  printers: [
    f('Printer Type', 'e.g. Ink tank / Laser / Inkjet', true),
    f('Functions', 'e.g. Print, Scan, Copy', true),
    f('Printing Output', 'e.g. Colour / Monochrome', true),
    f('Connectivity', 'e.g. USB, Wi-Fi', true),
    f('Print Speed', 'e.g. 33 ppm (mono), 15 ppm (colour)'),
    f('Maximum Print Resolution', 'e.g. 4800 x 1200 dpi'),
    f('Media Size Supported', 'e.g. A4, A5, Letter'),
    f('Duty Cycle', 'e.g. up to 3,000 pages a month'),
    f('Item Weight', 'e.g. 5.2 kg'),
    f('Product Dimensions', 'e.g. 37.5 x 34.7 x 17.9 cm'),
  ],
};

/** GST rates a product can carry. */
export const GST_RATES = [0, 5, 12, 18, 28];

/** Whether a barcode is a valid EAN-8, UPC-A (12), EAN-13 or GTIN-14: the
 *  right length, digits only, and a correct check digit. */
export function isValidGtin(code: string): boolean {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const digits = code.split('').map(Number);
  const check = digits.pop()!;
  // From the right, the digits beside the check digit weigh 3, then 1, alternately.
  const sum = digits.reverse().reduce((total, d, i) => total + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

/** The first problem with a listing's own barcodes: one that is not a valid
 *  barcode, or one used twice (on the product and a colour, say). */
export function barcodeProblem(listing: Pick<ListingForChecks, 'ean' | 'colours'>): string | null {
  const all = [
    ...(listing.ean ? [{ code: listing.ean, where: 'The product' }] : []),
    ...listing.colours.filter((c) => c.ean).map((c) => ({ code: c.ean!, where: c.name })),
  ];
  for (const { code, where } of all) {
    if (!isValidGtin(code)) return `${where}'s EAN ${code} is not a valid barcode: check the digits.`;
  }
  const seen = new Set<string>();
  for (const { code } of all) {
    if (seen.has(code)) return `The EAN ${code} is used twice in this listing.`;
    seen.add(code);
  }
  return null;
}

/** A web address from a title: "HP 15s (Core i5, 16GB)" → "hp-15s-core-i5-16gb". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '');
}

/** The first of `base`, `base-2`, `base-3`… not already taken. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || 'product';
  if (!taken.has(root)) return root;
  for (let n = 2; ; n++) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** What the publish checklist looks at. */
export interface ListingForChecks {
  name: string;
  categorySlug: string;
  brandName: string;
  priceInPaise: number;
  mrpInPaise: number | null;
  gallery: string[];
  highlights: string[];
  specs: { label: string; value: string }[];
  description: string;
  modelName: string | null;
  ean: string | null;
  hsnCode: string | null;
  gstRatePercent: number | null;
  inTheBox: string | null;
  countryOfOrigin: string | null;
  manufacturerDetails: string | null;
  colours: { name: string; ean: string | null; images: string[] }[];
}

/** Categories whose products always come in a colour, so a new listing
 *  names at least one. */
export const COLOUR_CATEGORIES = ['mobile-phones', 'laptops'];

/** Key highlights a new listing needs. */
export const MIN_HIGHLIGHTS = 4;

export interface ListingColour {
  key: string;
  name: string;
  hex: string;
  family: string[];
  images: string[];
  inStock: boolean | null;
  ean: string | null;
}

/** A whole listing, as the form edits it and the bulk sheet fills it. */
export interface Listing extends ListingForChecks {
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  inStock: boolean;
  sharedImages: string[];
  /** The title is built from the brand's title format. */
  titleAuto: boolean;
  modelNumber: string | null;
  partNumber: string | null;
  variant: string | null;
  warranty: string | null;
  warrantyPeriod: string | null;
  warrantyServiceType: string | null;
  warrantyCovered: string | null;
  packerDetails: string | null;
  importerDetails: string | null;
  packageLengthCm: number | null;
  packageBreadthCm: number | null;
  packageHeightCm: number | null;
  packageWeightKg: number | null;
  videoUrl: string | null;
  colours: ListingColour[];
}

/** A listing with nothing filled in yet. */
export const EMPTY_LISTING: Listing = {
  name: '',
  categorySlug: '',
  brandName: '',
  status: 'DRAFT',
  priceInPaise: 0,
  mrpInPaise: null,
  inStock: true,
  gallery: [],
  sharedImages: [],
  highlights: [],
  specs: [],
  description: '',
  titleAuto: false,
  modelName: null,
  modelNumber: null,
  partNumber: null,
  variant: null,
  ean: null,
  hsnCode: null,
  gstRatePercent: null,
  warranty: null,
  warrantyPeriod: null,
  warrantyServiceType: null,
  warrantyCovered: null,
  inTheBox: null,
  countryOfOrigin: null,
  manufacturerDetails: null,
  packerDetails: null,
  importerDetails: null,
  packageLengthCm: null,
  packageBreadthCm: null,
  packageHeightCm: null,
  packageWeightKg: null,
  videoUrl: null,
  colours: [],
};

/** The fields whose changes are listed by name, with their old and new values. */
const COMPARED = [
  'name',
  'titleAuto',
  'status',
  'categorySlug',
  'brandName',
  'modelName',
  'modelNumber',
  'partNumber',
  'variant',
  'priceInPaise',
  'mrpInPaise',
  'inStock',
  'ean',
  'gstRatePercent',
  'hsnCode',
  'description',
  'inTheBox',
  'warranty',
  'warrantyPeriod',
  'warrantyServiceType',
  'warrantyCovered',
  'countryOfOrigin',
  'manufacturerDetails',
  'packerDetails',
  'importerDetails',
  'packageLengthCm',
  'packageBreadthCm',
  'packageHeightCm',
  'packageWeightKg',
  'videoUrl',
] as const;

export type ChangeValue = string | number | boolean | null;
export interface FieldChange {
  field: string;
  from: ChangeValue;
  to: ChangeValue;
}

/** What changed between two versions of a listing, field by field, for the
 *  audit log and the bulk upload's preview. A spec is listed by its label;
 *  lists of photos and highlights by their length. */
export function listingChanges(before: Listing, after: Listing): FieldChange[] {
  const out: FieldChange[] = [];
  for (const field of COMPARED) {
    const from = before[field] ?? null;
    const to = after[field] ?? null;
    if (from !== to) out.push({ field, from, to });
  }

  const items = (list: unknown[]) => `${list.length} item${list.length === 1 ? '' : 's'}`;
  const listChange = (field: string, a: string[], b: string[]) => {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    out.push({ field, from: items(a), to: a.length === b.length ? `${items(b)}, edited` : items(b) });
  };
  listChange('photos', before.gallery, after.gallery);
  listChange('highlights', before.highlights, after.highlights);

  const oldSpecs = new Map(before.specs.map((s) => [s.label, s.value]));
  const newSpecs = new Map(after.specs.map((s) => [s.label, s.value]));
  for (const label of new Set([...oldSpecs.keys(), ...newSpecs.keys()])) {
    const from = oldSpecs.get(label) ?? null;
    const to = newSpecs.get(label) ?? null;
    if (from !== to) out.push({ field: `spec:${label}`, from, to });
  }
  if (
    oldSpecs.size === newSpecs.size &&
    [...oldSpecs].every(([label, value]) => newSpecs.get(label) === value) &&
    JSON.stringify(before.specs) !== JSON.stringify(after.specs)
  ) {
    out.push({ field: 'specs', from: 'original order', to: 'reordered' });
  }

  const colourSummary = (list: ListingColour[]) => list.map((c) => c.key).join(', ') || 'none';
  const colourShape = (list: ListingColour[]) => JSON.stringify(list.map((c) => [c.key, c.name, c.hex, c.ean, c.images, c.inStock, c.family]));
  if (colourShape(before.colours) !== colourShape(after.colours)) {
    out.push({ field: 'colours', from: colourSummary(before.colours), to: colourSummary(after.colours) });
  }
  if (JSON.stringify(before.sharedImages) !== JSON.stringify(after.sharedImages)) {
    out.push({ field: 'sharedPhotos', from: items(before.sharedImages), to: items(after.sharedImages) });
  }
  return out;
}

export interface Checklist {
  /** Must be fixed before the product can be published. */
  blocking: string[];
  /** Worth fixing; the product can still be published. */
  warnings: string[];
}

/** What a listing still needs, in the order of the form.
 *
 *  `linkedToSap`: a SAP code supplies the price and MRP, so the catalogue's
 *  may be left empty. `alreadyOnShop`: the product has been published (it
 *  is Active, or Inactive: taken off the shop). A new listing must have
 *  everything a marketplace asks for before it goes on the shop; for one
 *  published before, most of it is asked for rather than demanded, so the
 *  products listed before these fields existed stay editable and can go
 *  back on the shop without filling them all. */
export function checkListing(listing: ListingForChecks, linkedToSap: boolean, alreadyOnShop = false): Checklist {
  const blocking: string[] = [];
  const warnings: string[] = [];
  /** Demanded of a new listing, asked of a published one. */
  const need = (message: string) => (alreadyOnShop ? warnings : blocking).push(message);

  const filled = new Set(listing.specs.filter((s) => s.value.trim()).map((s) => s.label.toLowerCase()));
  const template = SPEC_TEMPLATES[listing.categorySlug] ?? [];
  const missingSpec = (field: SpecField) => field.required && !filled.has(field.label.toLowerCase());

  // 1-4: brand, model, variant, colour.
  if (!listing.categorySlug) blocking.push('Choose a category.');
  if (!listing.brandName.trim()) blocking.push('Choose a brand.');
  if (!listing.modelName?.trim()) need('Add the model name.');
  for (const field of template.filter((x) => x.variant && missingSpec(x))) need(`Fill in the ${field.label} of the variant.`);
  if (COLOUR_CATEGORIES.includes(listing.categorySlug) && listing.colours.length === 0) need('Add the colour.');
  if (listing.name.trim().length < 3) blocking.push('Add a product title.');

  // 5-10: price, barcode and tax.
  if (!linkedToSap && listing.mrpInPaise == null) need('Add the MRP.');
  if (!linkedToSap && listing.priceInPaise <= 0) blocking.push('Set a selling price, or link a SAP code on the SAP import page.');
  if (listing.mrpInPaise != null && listing.priceInPaise > listing.mrpInPaise) blocking.push('The selling price cannot be above the MRP.');
  if (listing.colours.length === 0) {
    if (!listing.ean) need('Add the EAN / barcode.');
  } else {
    const without = listing.colours.filter((c) => !c.ean).map((c) => c.name);
    if (without.length) need(`Add the EAN for ${without.join(', ')}.`);
  }
  if (listing.gstRatePercent == null) need('Choose the GST rate.');
  if (!listing.hsnCode) need('Add the HSN code.');

  // 11-14: photos, highlights, description, box.
  if (listing.gallery.length === 0) blocking.push('Add at least one photo.');
  const noPhotos = listing.colours.filter((c) => c.images.length === 0).map((c) => c.name);
  if (noPhotos.length) warnings.push(`Add photos of ${noPhotos.join(', ')}.`);
  if (listing.highlights.filter((h) => h.trim()).length < MIN_HIGHLIGHTS) need(`Add at least ${MIN_HIGHLIGHTS} key highlights.`);
  if (!listing.description.trim()) need('Add a description.');
  if (!listing.inTheBox?.trim()) need('Add what is in the box.');

  // Then the category's specs and the legal details.
  for (const field of template.filter((x) => !x.variant && missingSpec(x))) need(`Fill in the spec "${field.label}".`);
  if (!listing.countryOfOrigin?.trim()) need('Add the country of origin.');
  if (!listing.manufacturerDetails?.trim()) need("Add the manufacturer's name and address.");

  if (!linkedToSap) warnings.push('Link a SAP code (the SKU): until then shoppers can see it but not order it.');
  return { blocking, warnings };
}

/** Key highlights from the specs that matter most to shoppers: the variant,
 *  battery, screen and processor (and the camera, for a phone). */
export function suggestHighlights(categorySlug: string, specs: { label: string; value: string }[]): string[] {
  const spec = (...labels: string[]) => labels.map((l) => specs.find((s) => s.label.toLowerCase() === l.toLowerCase())?.value.trim()).find(Boolean) ?? '';
  const ram = tidySize(spec('RAM'));
  const storage = tidySize(spec('Internal Storage', 'Storage'));
  const out = [
    ram && storage ? `${ram} RAM | ${storage} ${categorySlug === 'mobile-phones' ? 'ROM' : 'Storage'}` : ram ? `${ram} RAM` : storage ? `${storage} Storage` : '',
    spec('Display Size', 'Screen Size') && `${spec('Display Size', 'Screen Size')} Display`,
    spec('Battery Capacity', 'Battery') && `${spec('Battery Capacity', 'Battery')} Battery`,
    spec('Processor') && `${spec('Processor')} Processor`,
    spec('Primary Camera') && `${spec('Primary Camera')} Rear Camera${spec('Secondary Camera') ? ` | ${spec('Secondary Camera')} Front Camera` : ''}`,
    spec('Operating System') && categorySlug !== 'mobile-phones' ? spec('Operating System') : '',
  ];
  return out.filter(Boolean).map((h) => h.replace(/\s+/g, ' ').trim());
}

/** A selling-price change of 40% or more either way, as the SAP import
 *  flags them: returns the change in percent, or null if smaller. */
export function bigPriceChange(fromPaise: number, toPaise: number): number | null {
  if (fromPaise <= 0 || toPaise <= 0) return null;
  const percent = Math.round(((toPaise - fromPaise) / fromPaise) * 100);
  return Math.abs(percent) >= 40 ? percent : null;
}
