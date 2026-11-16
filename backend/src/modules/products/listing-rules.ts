/* The rules of a product listing, apart from the database so they can be
   tested on their own: the spec fields each category asks for, barcode
   checks, the web address made from a title, and what a listing needs
   before it can go on the shop. */

export interface SpecField {
  label: string;
  /** Needed before the product can be published. */
  required: boolean;
  placeholder: string;
}

const f = (label: string, placeholder: string, required = false): SpecField => ({ label, placeholder, required });

/** The spec fields asked for per category, in the order the product page
 *  shows them. Labels follow the ones the catalogue already uses most.
 *  Categories without an entry take free-form specs. */
export const SPEC_TEMPLATES: Record<string, SpecField[]> = {
  laptops: [
    f('Processor', 'e.g. 13th Gen Intel Core i5-1335U', true),
    f('RAM', 'e.g. 16 GB DDR4', true),
    f('Storage', 'e.g. 512 GB SSD', true),
    f('Screen Size', 'e.g. 39.6 cm (15.6 inch)', true),
    f('Screen Resolution', 'e.g. 1920 x 1080 (Full HD)'),
    f('Graphics', 'e.g. Intel Iris Xe'),
    f('Operating System', 'e.g. Windows 11 Home', true),
    f('Battery', 'e.g. 3-cell, 41 Wh'),
    f('Item Weight', 'e.g. 1.6 kg'),
    f('Colour', 'e.g. Natural Silver'),
  ],
  'mobile-phones': [
    f('Display Size', 'e.g. 17.02 cm (6.7 inch)', true),
    f('Resolution', 'e.g. 2400 x 1080 pixels'),
    f('Processor', 'e.g. Snapdragon 8 Gen 3'),
    f('RAM', 'e.g. 8 GB', true),
    f('Internal Storage', 'e.g. 256 GB', true),
    f('Primary Camera', 'e.g. 50 MP + 12 MP + 10 MP', true),
    f('Secondary Camera', 'e.g. 12 MP'),
    f('Battery Capacity', 'e.g. 5000 mAh', true),
    f('Operating System', 'e.g. Android 14', true),
    f('Network Type', 'e.g. 5G, 4G LTE'),
    f('Item Weight', 'e.g. 196 g'),
    f('Product Dimensions', 'e.g. 16.3 x 7.6 x 0.8 cm'),
  ],
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
  ean: string | null;
  hsnCode: string | null;
  gstRatePercent: number | null;
  colours: { name: string; ean: string | null; images: string[] }[];
}

export interface Checklist {
  /** Must be fixed before the product can be published. */
  blocking: string[];
  /** Worth fixing; the product can still be published. */
  warnings: string[];
}

/** What a listing still needs. `linkedToSap`: a SAP code supplies the price,
 *  so the catalogue price may be left at zero. `alreadyOnShop`: the product
 *  is published already, so the category's required specs are asked for
 *  rather than demanded: products listed before the spec fields existed
 *  stay editable (to add a barcode, say) without filling them all first. */
export function checkListing(listing: ListingForChecks, linkedToSap: boolean, alreadyOnShop = false): Checklist {
  const blocking: string[] = [];
  const warnings: string[] = [];

  if (listing.name.trim().length < 3) blocking.push('Add a product title.');
  if (!listing.categorySlug) blocking.push('Choose a category.');
  if (!listing.brandName.trim()) blocking.push('Choose a brand.');
  if (listing.gallery.length === 0) blocking.push('Add at least one photo.');
  if (!linkedToSap && listing.priceInPaise <= 0) blocking.push('Set a selling price, or link a SAP code on the SAP import page.');
  if (listing.mrpInPaise != null && listing.priceInPaise > listing.mrpInPaise) blocking.push('The selling price cannot be above the MRP.');

  const filled = new Map(listing.specs.filter((s) => s.value.trim()).map((s) => [s.label.toLowerCase(), true]));
  for (const field of SPEC_TEMPLATES[listing.categorySlug] ?? []) {
    if (field.required && !filled.has(field.label.toLowerCase())) (alreadyOnShop ? warnings : blocking).push(`Fill in the spec "${field.label}".`);
  }

  if (!linkedToSap) warnings.push('Link a SAP code on the SAP import page: until then shoppers can see it but not order it.');
  if (listing.colours.length === 0) {
    if (!listing.ean) warnings.push('Add the EAN / barcode.');
  } else {
    const without = listing.colours.filter((c) => !c.ean).map((c) => c.name);
    if (without.length) warnings.push(`Add the EAN for ${without.join(', ')}.`);
    const noPhotos = listing.colours.filter((c) => c.images.length === 0).map((c) => c.name);
    if (noPhotos.length) warnings.push(`Add photos of ${noPhotos.join(', ')}.`);
  }
  if (listing.highlights.filter((h) => h.trim()).length < 3) warnings.push('Add at least 3 key highlights.');
  if (!listing.description.trim()) warnings.push('Add a description.');
  if (!listing.hsnCode) warnings.push('Add the HSN code.');
  if (listing.gstRatePercent == null) warnings.push('Choose the GST rate.');

  return { blocking, warnings };
}

/** A selling-price change of 40% or more either way, as the SAP import
 *  flags them: returns the change in percent, or null if smaller. */
export function bigPriceChange(fromPaise: number, toPaise: number): number | null {
  if (fromPaise <= 0 || toPaise <= 0) return null;
  const percent = Math.round(((toPaise - fromPaise) / fromPaise) * 100);
  return Math.abs(percent) >= 40 ? percent : null;
}
