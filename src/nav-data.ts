import { categories } from './data';

const sub = (parent: string, label: string, keyword: string) => ({
  label,
  href: `/shop/${parent}?sub=${encodeURIComponent(keyword)}`,
});

export interface ShopMegaCategory {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

/** A sub-category of a shop category: its menu label, the key it carries in
 *  the URL (`?sub=`), and the rule that decides which of the category's
 *  products belong to it.
 *
 *  The catalogue has no sub-category field, so each rule reads the product
 *  name. They were written against the names actually in the catalogue: a
 *  bare keyword is not enough — "laser" would file "LaserJet Tank" under ink
 *  tanks if "tank" were tested first, "keyboard" would swallow the
 *  keyboard-and-mouse combos, and no phone calls itself a "smartphone". */
interface SubCategoryDef {
  label: string;
  keyword: string;
  test: (name: string) => boolean;
}

const has = (pattern: RegExp) => (name: string) => pattern.test(name);
const isTablet = has(/\bipad\b|\btab\b|tablet/i);
const isFeaturePhone = has(/feature phone|keypad/i);
const isCombo = has(/combo|keyboard (and|&) mouse/i);

const SUB_MAP: Record<string, SubCategoryDef[]> = {
  laptops: [
    { label: 'MacBook', keyword: 'macbook', test: has(/macbook/i) },
    {
      label: 'Gaming Laptops',
      keyword: 'gaming',
      test: has(/gaming|\brog\b|\btuf\b|predator|victus|\bomen\b|\bg15\b|legion|nitro/i),
    },
    // No product is labelled for homeschooling; this is the entry-level end
    // of the range — Chromebooks and Celeron / Core i3 / Ryzen 3 machines.
    {
      label: 'Homeschooling Laptops',
      keyword: 'homeschooling',
      test: has(/chromebook|celeron|core i3|\bi3\b|ryzen 3\b|\br3\b/i),
    },
    { label: '2 in 1 Laptops with Pen', keyword: '2-in-1', test: has(/2[- ]in[- ]1|x360|convertible|convert\b/i) },
  ],
  'mobile-phones': [
    { label: 'iPhones', keyword: 'iphone', test: has(/iphone/i) },
    { label: 'iPads', keyword: 'ipad', test: has(/\bipad\b/i) },
    { label: 'Tablets', keyword: 'tablet', test: isTablet },
    // Everything in the category that is a phone rather than a tablet.
    { label: 'Smartphones', keyword: 'smartphone', test: (name) => !isTablet(name) && !isFeaturePhone(name) },
    { label: 'Feature Phones', keyword: 'feature', test: isFeaturePhone },
  ],
  accessories: [
    { label: 'Adapters', keyword: 'adapter', test: has(/adapter|adaptor|charger/i) },
    { label: 'Cabinet', keyword: 'cabinet', test: has(/cabinet/i) },
    { label: 'CPU Cooling Fan', keyword: 'cooling', test: has(/cpu (cooling )?fan|cpu cooler/i) },
    { label: 'Earphone and Headphones', keyword: 'headphone', test: has(/earphone|headphone|earpods|headset/i) },
    // The catalogue cuts long names short — one mouse's name ends "Gaming Mo".
    { label: 'Gaming Mouse', keyword: 'mouse', test: (name) => /mouse|gaming mo$/i.test(name) && !isCombo(name) },
    { label: 'Keyboards', keyword: 'keyboard', test: (name) => /keyboard/i.test(name) && !isCombo(name) },
    { label: 'Keyboard & Mouse Combo', keyword: 'combo', test: isCombo },
    { label: 'Laptop Cooling Pads', keyword: 'cooling pad', test: has(/cooling pad|laptop cooler/i) },
    { label: 'Power Banks', keyword: 'power bank', test: has(/power ?bank/i) },
    { label: 'Smart Watches', keyword: 'watch', test: has(/watch/i) },
    { label: 'SMPS', keyword: 'smps', test: has(/smps|power supply/i) },
    { label: 'Webcams', keyword: 'webcam', test: has(/web ?cam/i) },
  ],
  desktops: [
    { label: 'All in One PCs', keyword: 'all-in-one', test: has(/all[- ]in[- ]one|\baio\b/i) },
    { label: 'Tower PCs', keyword: 'tower', test: (name) => /tower|desktop/i.test(name) && !/all[- ]in[- ]one|\baio\b/i.test(name) },
  ],
  printers: [
    { label: 'Ink Tank Printers', keyword: 'tank', test: (name) => /tank/i.test(name) && !/laser/i.test(name) },
    { label: 'Inkjet Printers', keyword: 'inkjet', test: has(/inkjet|deskjet|pixma/i) },
    { label: 'LaserJet Printers', keyword: 'laser', test: has(/laser/i) },
  ],
  'storage-devices': [
    { label: 'External Hard Disks', keyword: 'external', test: has(/external|portable (hard|hdd)/i) },
    { label: 'Internal Hard Disk Drives', keyword: 'internal', test: has(/internal hard|internal hdd/i) },
    { label: 'Pen Drives', keyword: 'pen drive', test: has(/pen ?drive|flash drive/i) },
    { label: 'SSD', keyword: 'ssd', test: has(/\bssd\b|solid state/i) },
  ],
  software: [
    { label: 'Antivirus & Security Software', keyword: 'security', test: has(/antivirus|anti-virus|security/i) },
    { label: 'Operating Systems', keyword: 'windows', test: has(/windows \d|operating system/i) },
  ],
  wireless: [{ label: 'True Wireless Earbuds', keyword: 'buds', test: has(/buds|true wireless/i) }],
};

export interface SubCategory {
  label: string;
  keyword: string;
  href: string;
  /** Whether a product (by name) belongs to this sub-category. */
  test: (name: string) => boolean;
}

/** The sub-categories of a shop category, in menu order. */
export function subCategoriesOf(categorySlug: string): SubCategory[] {
  return (SUB_MAP[categorySlug] ?? []).map((s) => ({ ...s, href: sub(categorySlug, s.label, s.keyword).href }));
}

/** The sub-category a `?sub=` value refers to, if it is a real one. */
export function findSubCategory(categorySlug: string, key: string | null | undefined): SubCategory | undefined {
  if (!key) return undefined;
  const wanted = key.trim().toLowerCase();
  return subCategoriesOf(categorySlug).find((s) => s.keyword === wanted);
}

export const SHOP_MEGA: ShopMegaCategory[] = categories.map((c) => ({
  label: c.name,
  href: `/shop/${c.slug}`,
  children: SUB_MAP[c.slug]?.map((s) => sub(c.slug, s.label, s.keyword)),
}));

export const ABOUT_MENU = [
  { label: 'Overview', href: '/about' },
  { label: 'Board of Directors & KMP', href: '/about/board-of-directors-and-kmp' },
  { label: 'Composition Of Committees', href: '/about/composition-of-committees' },
];

export interface InvestorMegaColumn {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export const INVESTOR_MEGA: InvestorMegaColumn[] = [
  {
    label: 'Performance',
    children: [
      { label: 'Annual Report', href: '/investor/annual-report' },
      { label: 'Annual Return', href: '/investor/annual-return' },
      { label: 'Financial Results', href: '/investor/financial-results' },
      { label: 'Secretarial Compliance', href: '/investor/secretarial-compliance' },
      { label: 'Projects', href: '/investor' },
    ],
  },
  {
    label: 'Shareholder Information',
    children: [
      { label: 'Notice', href: '/investor/notice' },
      { label: 'Board Meeting', href: '/investor/board-meeting' },
      { label: 'General Meeting', href: '/investor/general-meeting' },
      { label: 'Committee Meeting', href: '/investor/committee-meeting' },
      { label: 'Policies', href: '/investor/policies' },
      { label: 'Advertisement', href: '/advertisement' },
      { label: 'Material Creditors', href: '/investor/material-creditors' },
      { label: 'Basis Of Allotment', href: '/basis-of-allotment' },
      { label: 'Shareholding Pattern', href: '/investor/shareholding-pattern' },
      { label: 'Familiarization Program', href: '/investor/familiarization-program' },
    ],
  },
  {
    label: 'Fund Raising',
    children: [
      { label: 'Fund Raising', href: '/investor/fund-raising' },
      { label: 'Prospectus', href: '/investor/prospectus' },
    ],
  },
  {
    label: 'Stock Exchange',
    children: [
      { label: 'Corporate Announcement', href: '/investor/corporate-announcement' },
      { label: 'Authorized Person', href: '/authorized-person' },
      { label: 'Grievance Redressal', href: '/grievance-redressal' },
    ],
  },
  {
    label: 'Group Companies',
    children: [
      { label: 'Group Companies', href: '/investor/group-companies' },
      { label: 'Subsidiary Audit Reports', href: '/investor/subsidiary-audit-reports' },
    ],
  },
];
