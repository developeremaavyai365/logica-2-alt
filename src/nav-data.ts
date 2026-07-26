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

const SUB_MAP: Record<string, { label: string; keyword: string }[]> = {
  laptops: [
    { label: 'MacBook', keyword: 'macbook' },
    { label: 'Gaming Laptops', keyword: 'gaming' },
    { label: 'Homeschooling Laptops', keyword: 'homeschooling' },
    { label: '2 in 1 Laptops with Pen', keyword: '2-in-1' },
  ],
  'mobile-phones': [
    { label: 'iPhones', keyword: 'iphone' },
    { label: 'iPads', keyword: 'ipad' },
    { label: 'Tablets', keyword: 'tablet' },
    { label: 'Smartphones', keyword: 'smartphone' },
    { label: 'Feature Phones', keyword: 'feature' },
  ],
  accessories: [
    { label: 'Adapters', keyword: 'adapter' },
    { label: 'Cabinet', keyword: 'cabinet' },
    { label: 'CPU Cooling Fan', keyword: 'cooling' },
    { label: 'Earphone and Headphones', keyword: 'headphone' },
    { label: 'Gaming Mouse', keyword: 'mouse' },
    { label: 'Keyboards', keyword: 'keyboard' },
    { label: 'Keyboard & Mouse Combo', keyword: 'combo' },
    { label: 'Laptop Cooling Pads', keyword: 'cooling pad' },
    { label: 'Power Banks', keyword: 'power bank' },
    { label: 'Smart Watches', keyword: 'watch' },
    { label: 'SMPS', keyword: 'smps' },
    { label: 'Webcams', keyword: 'webcam' },
  ],
  desktops: [
    { label: 'All in One PCs', keyword: 'all-in-one' },
    { label: 'Tower PCs', keyword: 'tower' },
  ],
  printers: [
    { label: 'Ink Tank Printers', keyword: 'tank' },
    { label: 'Inkjet Printers', keyword: 'inkjet' },
    { label: 'LaserJet Printers', keyword: 'laser' },
  ],
  'storage-devices': [
    { label: 'External Hard Disks', keyword: 'external' },
    { label: 'Internal Hard Disk Drives', keyword: 'internal' },
    { label: 'Pen Drives', keyword: 'pen drive' },
    { label: 'SSD', keyword: 'ssd' },
  ],
  software: [
    { label: 'Antivirus & Security Software', keyword: 'security' },
    { label: 'Operating Systems', keyword: 'windows' },
  ],
  wireless: [{ label: 'True Wireless Earbuds', keyword: 'buds' }],
};

export const SHOP_MEGA: ShopMegaCategory[] = categories.map((c) => ({
  label: c.name,
  href: `/shop/${c.slug}`,
  children: SUB_MAP[c.slug]?.map((s) => sub(c.slug, s.label, s.keyword)),
}));

export const ABOUT_MENU = [
  { label: 'Overview', href: '/about' },
  { label: 'Organization Chart', href: '/about/organization-chart' },
  { label: 'Board of Directors & KMP', href: '/about/board-of-directors-and-kmp' },
  { label: 'Composition Of Committees', href: '/about/composition-of-committees' },
];

export interface InvestorMegaColumn {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const LIW = 'https://www.logicainfoway.com';

export const INVESTOR_MEGA: InvestorMegaColumn[] = [
  {
    label: 'Performance',
    children: [
      { label: 'Annual Report', href: '/investor/annual-report' },
      { label: 'Annual Return', href: '/investor/annual-return' },
      { label: 'Board Meeting', href: '/investor/notice-of-board-meeting' },
      { label: 'Financial Results', href: '/investor/financial-results' },
      { label: 'General Meeting', href: '/investor/general-meeting' },
      { label: 'Secretarial Compliance', href: '/investor/secretarial-compliance' },
      { label: 'Projects', href: '/investor' },
    ],
  },
  {
    label: 'Shareholder Information',
    children: [
      { label: 'Notice', href: '/investor/notice' },
      { label: 'Board Meeting', href: '/investor/board-meeting' },
      { label: 'General Meeting', href: '/investor/notice-of-general-meeting' },
      { label: 'Committee Meeting', href: '/investor/committee-meeting' },
      { label: 'Policies', href: '/investor/policies' },
      { label: 'Advertisement', href: `${LIW}/advertisement/` },
      { label: 'Material Creditors', href: '/investor/material-creditors' },
      { label: 'Basis Of Allotment', href: `${LIW}/basis-of-allotment/` },
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
      { label: 'Authorized Person', href: '/investor' },
      { label: 'Grievance Redressal', href: '/investor' },
    ],
  },
  {
    label: 'Group Companies',
    href: '/investor/group-companies',
  },
];
