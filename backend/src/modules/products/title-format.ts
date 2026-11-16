/* Product titles built from a brand's title format: "Samsung Galaxy S24 5G
   (Onyx Black, 8 GB RAM, 256 GB Storage)".

   No imports on purpose: the admin's product page uses this same file to
   show the title as it is typed, and the server uses it to save it.

   A format is text with fields in braces: {brand} {model} ({colour},
   {ram} RAM, {storage} Storage). Fields are the names below, or any spec's
   label, such as {Printer Type}. A part whose field is empty drops out
   whole, so a missing value never leaves "( , )" or a stray "RAM":
     - inside brackets, each part between commas or slashes;
     - outside, each part between ", ", and each word in it. */

/** The fields a format can use, with what each one is. */
export const TITLE_FIELDS: { key: string; label: string }[] = [
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model name' },
  { key: 'modelNumber', label: 'Model number' },
  { key: 'colour', label: 'Colour' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'variant', label: 'Variant' },
  { key: 'processor', label: 'Processor' },
  { key: 'screen', label: 'Screen size' },
  { key: 'os', label: 'Operating system' },
];

/** Where a field's value comes from among the specs, first found wins. */
const FROM_SPECS: Record<string, string[]> = {
  ram: ['RAM'],
  storage: ['Internal Storage', 'Storage'],
  processor: ['Processor'],
  screen: ['Display Size', 'Screen Size'],
  os: ['Operating System'],
};

export interface TitleFormatRule {
  /** A brand's name, or null for every brand in the category. */
  brand: string | null;
  /** A category's slug, or null for every category. */
  category: string | null;
  pattern: string;
}

const PHONE_WITH_RAM = '{brand} {model} ({colour}, {ram} RAM, {storage} Storage)';

/** The built-in formats, modelled on how each brand's products are usually
 *  listed in Indian online stores. Admins can change any of them, and add
 *  their own, on the Title formats page. */
export const DEFAULT_TITLE_FORMATS: TitleFormatRule[] = [
  { brand: 'Apple', category: 'mobile-phones', pattern: '{brand} {model} ({colour}, {storage})' },
  ...['Samsung', 'OnePlus', 'realme', 'vivo', 'OPPO', 'Redmi', 'Xiaomi', 'HONOR'].map((brand) => ({
    brand,
    category: 'mobile-phones',
    pattern: PHONE_WITH_RAM,
  })),
  { brand: null, category: 'mobile-phones', pattern: '{brand} {model} ({colour}, {storage}) ({ram} RAM)' },
  { brand: 'Apple', category: 'laptops', pattern: '{brand} {model} ({ram}/{storage}, {colour}) {modelNumber}' },
  { brand: 'HP', category: 'laptops', pattern: '{brand} {model}, {processor}, {ram}, {storage}, {screen}, {os}, {colour}, {modelNumber}' },
  { brand: null, category: 'laptops', pattern: '{brand} {model} {processor} ({ram}/{storage}/{os}) {modelNumber}, {screen}, {colour}' },
  { brand: null, category: 'printers', pattern: '{brand} {model} {Printer Type} Printer ({Functions}, {Printing Output}, {Connectivity})' },
  { brand: null, category: null, pattern: '{brand} {model} ({variant}, {colour})' },
];

const lower = (s: string | null) => (s ?? '').toLowerCase();

/** The format for a brand in a category: the brand's own, else the
 *  category's general one, else the general one for every category. The
 *  admin's formats come first at each step. */
export function pickTitleFormat(brand: string, category: string, saved: TitleFormatRule[]): TitleFormatRule {
  const tiers: [string | null, string | null][] = [
    [brand, category],
    [null, category],
    [null, null],
  ];
  for (const [b, c] of tiers) {
    for (const list of [saved, DEFAULT_TITLE_FORMATS]) {
      const found = list.find((r) => lower(r.brand) === lower(b) && (r.category ?? null) === c);
      if (found) return found;
    }
  }
  return DEFAULT_TITLE_FORMATS[DEFAULT_TITLE_FORMATS.length - 1];
}

/** "8GB" and "8 gb" → "8 GB"; "1TB" → "1 TB". */
export function tidySize(text: string): string {
  return text.replace(/(\d)\s*(gb|tb|mb)\b/gi, (_, digit: string, unit: string) => `${digit} ${unit.toUpperCase()}`);
}

export interface TitleInput {
  brand: string;
  modelName: string | null;
  modelNumber: string | null;
  variant: string | null;
  specs: { label: string; value: string }[];
}

/** The values a format fills in, for one colour (or none). */
export function titleValues(input: TitleInput, colour: string | null): Record<string, string> {
  const spec = (label: string) => input.specs.find((s) => s.label.toLowerCase() === label.toLowerCase())?.value.trim() ?? '';
  const fromSpecs = (key: string) => FROM_SPECS[key].map(spec).find(Boolean) ?? '';

  const brand = input.brand.trim();
  // "Samsung Galaxy S24" under the brand Samsung: the brand is written once.
  let model = (input.modelName ?? '').trim();
  if (brand && model.toLowerCase().startsWith(`${brand.toLowerCase()} `)) model = model.slice(brand.length + 1).trim();

  const ram = tidySize(fromSpecs('ram'));
  const storage = tidySize(fromSpecs('storage'));
  const values: Record<string, string> = {
    brand,
    model,
    modelNumber: (input.modelNumber ?? '').trim(),
    colour: (colour ?? '').trim(),
    ram,
    storage,
    variant: tidySize((input.variant ?? '').trim()) || [ram, storage].filter(Boolean).join('/'),
    processor: fromSpecs('processor'),
    screen: fromSpecs('screen'),
    os: fromSpecs('os'),
  };
  // Any other spec by its label, for formats such as {Printer Type}. The
  // fields above keep their own, tidied, values.
  const known = new Set(Object.keys(values).map((k) => k.toLowerCase()));
  for (const s of input.specs) {
    const key = s.label.trim().toLowerCase();
    if (key && !known.has(key) && !(key in values)) values[key] = s.value.trim();
  }
  return values;
}

const FIELD = /\{([^{}]+)\}/g;

function fill(text: string, values: Record<string, string>): string | null {
  let empty = false;
  const out = text.replace(FIELD, (_, name: string) => {
    const key = name.trim();
    const value = values[key] ?? values[key.toLowerCase()] ?? '';
    if (!value) empty = true;
    return value;
  });
  return empty ? null : out;
}

/** One stretch outside brackets: each word, and each bracketed group, drops
 *  out on its own when a field in it is empty. */
function renderStretch(text: string, values: Record<string, string>): string {
  const parts: string[] = [];
  // Bracketed groups, or runs of anything else.
  for (const [, group, open, inner, close, plain] of text.matchAll(/((\(|\[)([^()[\]]*)(\)|\]))|([^()[\]]+)/g)) {
    if (group) {
      // Pieces with the separator written before each ("," or "/"); a
      // dropped piece takes its separator with it.
      const tokens = inner.split(/\s*([,/])\s*/);
      let out = '';
      for (let i = 0; i < tokens.length; i += 2) {
        const filled = fill(tokens[i].trim(), values);
        if (!filled || !filled.trim()) continue;
        const separator = i === 0 ? ',' : tokens[i - 1];
        out += out ? (separator === '/' ? '/' : ', ') + filled : filled;
      }
      if (out) parts.push(`${open}${out}${close}`);
    } else if (plain) {
      // Words, keeping a field with a space in its name ({Printer Type}) whole.
      for (const word of plain.match(/(?:[^\s{]|\{[^}]*\})+/g) ?? []) {
        const filled = fill(word, values);
        if (filled) parts.push(filled);
      }
    }
  }
  return parts.join(' ');
}

/** The title a format gives. Empty fields drop out cleanly, spacing is
 *  tidied, and it is cut to the 200 characters a title may have. */
export function renderTitle(pattern: string, values: Record<string, string>): string {
  const title = pattern
    .split(/\s*,\s+(?![^()[\]]*[)\]])/)
    .map((stretch) => renderStretch(stretch, values))
    .filter((stretch) => stretch.trim() !== '')
    .join(', ')
    .replace(/\s+/g, ' ')
    .trim();
  return title.length > 200 ? title.slice(0, 200).replace(/[\s,(/-]+$/, '') : title;
}

/** The title for a listing, for one colour of it or none. */
export function buildTitle(pattern: string, input: TitleInput, colour: string | null): string {
  return renderTitle(pattern, titleValues(input, colour));
}
