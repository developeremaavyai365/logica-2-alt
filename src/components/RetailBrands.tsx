import LogoMarquee, { type LogoItem } from './LogoMarquee';

/* The brands sold across the counters, below the figures.

   The list is the catalogue's own — every name here is one products-data.ts
   already stocks or one whose artwork was put in public/logos/brands for the
   purpose — rather than a wishlist of logos that would look good in a row.

   Artwork is in public/logos/retail, each file cropped to its own mark and,
   where it arrived flattened onto a coloured or off-white rectangle, keyed
   back to transparent. Lenovo, OnePlus, Acer, Honor and Canon came from
   Wikimedia Commons; Zebronics was supplied by Armaan, Commons having only
   photographs of their hardware; the rest were already in the repo.

   Every brand now carries a mark. Any that loses its file still falls back to
   its name set as a wordmark rather than showing a broken image — drop a
   replacement into public/logos/retail and point `src` at it. */
const BRANDS: LogoItem[] = [
  { name: 'Samsung', src: '/logos/retail/samsung.png' },
  { name: 'Apple', src: '/logos/retail/apple.png', scale: 0.82 },
  { name: 'HP', src: '/logos/retail/hp.svg', scale: 0.92 },
  { name: 'ASUS', src: '/logos/retail/asus.png' },
  { name: 'Dell', src: '/logos/retail/dell.png' },
  { name: 'Lenovo', src: '/logos/retail/lenovo.svg' },
  { name: 'OnePlus', src: '/logos/retail/oneplus.png', scale: 1.2 },
  { name: 'Vivo', src: '/logos/retail/vivo.png' },
  { name: 'Oppo', src: '/logos/retail/oppo.png' },
  { name: 'realme', src: '/logos/retail/realme.png' },
  { name: 'Xiaomi', src: '/logos/retail/xiaomi.png' },
  { name: 'Poco', src: '/logos/retail/poco.png' },
  { name: 'Motorola', src: '/logos/retail/motorola.png' },
  { name: 'Nothing', src: '/logos/retail/nothing.png' },
  { name: 'Acer', src: '/logos/retail/acer.svg' },
  { name: 'Honor', src: '/logos/retail/honor.svg' },
  { name: 'Canon', src: '/logos/retail/canon.svg' },
  { name: 'Zebronics', src: '/logos/retail/zebronics.png' },
];

export default function RetailBrands() {
  /* Runs the other way to the channel partner strip above it, so the two do
     not read as the same object repeated down the page. */
  return <LogoMarquee label="Retail Partners" items={BRANDS} reverse />;
}
