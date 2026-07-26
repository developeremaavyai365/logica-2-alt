/**
 * The scraped catalog has no structured spec fields — only a free-text
 * `name` that, for most listings, already packs in the spec sheet. This
 * pulls out ONLY tokens it can match with confidence; nothing here is
 * fabricated, every value is a literal substring of the product's real name.
 */

export interface ExtractedSpecs {
  processor?: string;
  ram?: string;
  storage?: string;
  os?: string;
  display?: string;
  graphics?: string;
  generation?: string;
}

const PATTERNS: Array<{ key: keyof ExtractedSpecs; re: RegExp }> = [
  { key: 'processor', re: /\b(Intel Core i\d(?:-\d{3,5}[A-Z]{0,2})?|AMD Ryzen \d ?\d{0,4}[A-Z]{0,2}|Apple M\d(?: Pro| Max| Ultra)?|Snapdragon \d+[A-Za-z0-9 ]*|MediaTek [A-Za-z0-9 ]+|Core i\d)\b/i },
  { key: 'generation', re: /\b(\d{1,2}(?:st|nd|rd|th) Gen(?:eration)?)\b/i },
  { key: 'ram', re: /\b(\d{1,3} ?GB) RAM\b/i },
  { key: 'storage', re: /\b(\d{1,4} ?(?:GB|TB)) (?:SSD|HDD|Hard Drive|Hard Disk)\b/i },
  { key: 'os', re: /\b(Windows \d{1,2}(?: Home| Pro)?(?: Single Language)?|macOS|Chrome OS|DOS)\b/i },
  { key: 'display', re: /\b(\d{1,2}(?:\.\d)?["”]|\d{1,2}(?:\.\d)? ?(?:inch|cm)) [A-Za-z]*(?:FHD|HD|QHD|UHD|Retina)?\b/i },
  { key: 'graphics', re: /\b(NVIDIA GeForce [A-Za-z0-9 ]+|AMD Radeon [A-Za-z0-9 ]+|Intel (?:UHD|Iris Xe|HD) Graphics)\b/i },
];

export function extractSpecs(name: string): ExtractedSpecs {
  const out: ExtractedSpecs = {};
  for (const { key, re } of PATTERNS) {
    const m = name.match(re);
    if (m) out[key] = m[1].trim();
  }
  return out;
}

export const SPEC_LABELS: Record<keyof ExtractedSpecs, string> = {
  processor: 'Processor',
  generation: 'Processor Generation',
  ram: 'RAM',
  storage: 'Storage',
  os: 'Operating System',
  display: 'Display',
  graphics: 'Graphics',
};

export const SPEC_ORDER: (keyof ExtractedSpecs)[] = [
  'processor',
  'generation',
  'ram',
  'storage',
  'os',
  'display',
  'graphics',
];
