import {
  Laptop,
  Smartphone,
  Headphones,
  Monitor as MonitorIcon,
  Printer,
  HardDrive,
  MonitorSmartphone,
  ShieldCheck,
  Briefcase,
  Radio,
  type LucideIcon,
} from 'lucide-react';

export type Category = {
  slug: string;
  icon: LucideIcon;
  name: string;
  tagline: string;
  description: string;
};

export const categories: Category[] = [
  { slug: 'laptops', icon: Laptop, name: 'Laptops', tagline: 'Ultrabooks, gaming rigs & pro machines', description: 'Business-grade portables and gaming powerhouses from every major brand — configured, imaged and warranty-backed.' },
  { slug: 'mobile-phones', icon: Smartphone, name: 'Mobile Phones', tagline: 'Flagships, mid-range & budget picks', description: 'The latest 5G smartphones from brands you trust, with genuine warranty and enterprise supply options.' },
  { slug: 'accessories', icon: Headphones, name: 'Accessories', tagline: 'Everything around your setup', description: 'Keyboards, mice, wearables and webcams — complete your workspace with the right add-ons.' },
  { slug: 'desktops', icon: MonitorSmartphone, name: 'Desktops', tagline: 'All-in-one desktops for office performance', description: 'Space-saving all-in-ones and desktop towers built for offices, labs and government deployments.' },
  { slug: 'monitors', icon: MonitorIcon, name: 'Monitors', tagline: 'Crisp screens, better productivity', description: 'From everyday FHD panels to high-refresh and curved displays for creative and trading desks.' },
  { slug: 'printers', icon: Printer, name: 'Printers', tagline: 'Print faster, work smarter', description: 'Inkjet, laser and all-in-one printers for home offices to high-volume enterprise workflows.' },
  { slug: 'storage-devices', icon: HardDrive, name: 'Storage Devices', tagline: 'SSDs, drives & memory that keep up', description: 'Portable SSDs, external hard drives and memory cards — fast, reliable storage for work and backup.' },
  { slug: 'software', icon: ShieldCheck, name: 'Software', tagline: 'Genuine licenses & subscriptions', description: 'Operating systems, productivity suites and security — licensed and delivered for teams.' },
  { slug: 'laptop-bags', icon: Briefcase, name: 'Laptop Bags', tagline: 'Carry it in style & safety', description: 'Backpacks, briefcases and sleeves engineered to protect your gear on the move.' },
  { slug: 'wireless', icon: Radio, name: 'Wireless', tagline: 'True wireless audio, untethered', description: 'Earbuds, headphones and wireless audio engineered for crystal-clear calls and immersive sound.' },
];

export const pillars = [
  { title: 'Enterprise & government trusted', description: 'Three decades of corporate and government procurement, recognized with distributor and retail-performance awards from HP, Samsung and Flipkart.' },
  { title: 'End-to-end technology, not just hardware', description: 'Hardware, networking and IT solutions under one roof — a single partner for the whole stack.' },
  { title: 'Cost-effective by design', description: 'Genuine products and authorized brand partnerships, priced to make sense at enterprise scale.' },
  { title: 'Nationwide reach', description: 'From our Kolkata roots to Delhi, Mumbai, Bengaluru and beyond — wherever your business operates.' },
];

export const trustStrip = [
  { value: '30+ yrs', label: 'In business, since 1995' },
  { value: '8', label: 'Cities served nationwide' },
  { value: '10+', label: 'Product categories' },
  { value: 'Corp & Govt', label: 'Trusted client base' },
];

/* Brought in line with the figures the rest of the site publishes, which had
   drifted well past these: the homepage stats block, the vertical captions
   and the Who We Are statement were all on 90+ stores and 11+ distribution
   centres while this block still said 52 and 5.

   Every figure here traces to one the site already carries rather than a new
   claim — stores and distribution centres from the homepage stats block,
   cities from the trust strip's own "8 cities served nationwide" (which this
   block contradicted with 11), and offices from the seven office cities the
   site has been publishing.

   The plus signs are kept rather than written out, matching the homepage, so
   this cannot end up asserting an exact 90 where the rest of the site says
   "or more". */
export const scaleStats = [
  { value: '7', label: 'Offices' },
  { value: '90+', label: 'Retail stores' },
  { value: '11+', label: 'Distribution centres' },
  { value: '8', label: 'Cities' },
];

export const nameHistory = [
  { name: 'Oswal Infotech Private Limited', event: 'Original incorporation', date: 'July 28, 1995' },
  { name: 'Eastern Infoway Private Limited', event: 'Renamed', date: 'December 5, 2000' },
  { name: 'Eastern Infoway Limited', event: 'Converted to a public company', date: 'January 2, 2001' },
  { name: 'Eastern Logica Infoway Limited', event: 'Renamed', date: 'February 3, 2003' },
  { name: 'Logica Infoway Limited', event: 'Renamed', date: 'March 20, 2024' },
];

export type Office = {
  city: string;
  label: string;
  address: string;
  phone: string;
};

export const offices: Office[] = [
  { city: 'Kolkata', label: 'Head Office', address: '2 Saklat Place, 1st Floor, Kolkata, West Bengal – 700072', phone: '+91 7003999192 / 033 4058-0000' },
  { city: 'Delhi', label: 'Delhi', address: 'A-78, 3rd Floor, Okhla Phase II, New Delhi – 110020', phone: '+91 7003999192 / 011 4362-8116' },
  { city: 'Bangalore', label: 'Bangalore', address: '14, Sunkalpet Main Road, 1st Floor, Bangalore – 560002', phone: '+91 7003999192' },
  { city: 'Hyderabad', label: 'Hyderabad', address: 'Shop No. 12B, G. Floor, Emarald House, S.D. Road, Telengana – 500003', phone: '+91 7003999192' },
  { city: 'Mumbai', label: 'Mumbai', address: 'Build no. A-7, Gala no. S-102, Anmol Textile Market, Bhiwandi, Mumbai – 421302', phone: '+91 7003999192' },
];

export const socials = [
  { label: 'Facebook', href: 'https://facebook.com/easternlogicaofficial' },
  { label: 'Twitter', href: 'https://twitter.com/eastern_logica' },
  { label: 'Instagram', href: 'https://www.instagram.com/logicainfowayofficial/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/easternlogicainfowayltd' },
  { label: 'Pinterest', href: 'https://pinterest.com/eastern_logica' },
];

export type { Product } from './products-data';
export { products } from './products-data';

export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
