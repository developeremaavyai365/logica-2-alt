/** Maps a catalogue brand name to a real logo file already checked into
 *  `public/logos/retail/` — the same set the homepage's Retail Partners
 *  strip uses: each one cropped tight to its own mark on a transparent
 *  ground. Brands not listed here fall back to a lettered tile in the UI —
 *  never a hotlinked or fabricated logo. Keys are lowercase, so the lookup
 *  does not depend on how a brand happens to be capitalised. */
const BRAND_LOGO_FILES: Record<string, string> = {
  acer: '/logos/retail/acer.svg',
  apple: '/logos/retail/apple.png',
  asus: '/logos/retail/asus.png',
  canon: '/logos/retail/canon.svg',
  dell: '/logos/retail/dell.png',
  honor: '/logos/retail/honor.svg',
  hp: '/logos/retail/hp.svg',
  lenovo: '/logos/retail/lenovo.svg',
  motorola: '/logos/retail/motorola.png',
  nothing: '/logos/retail/nothing.png',
  oneplus: '/logos/retail/oneplus.png',
  oppo: '/logos/retail/oppo.png',
  poco: '/logos/retail/poco.png',
  realme: '/logos/retail/realme.png',
  samsung: '/logos/retail/samsung.png',
  vivo: '/logos/retail/vivo.png',
  xiaomi: '/logos/retail/xiaomi.png',
  zebronics: '/logos/retail/zebronics.png',
};

export function brandLogoFor(brand: string): string | undefined {
  return BRAND_LOGO_FILES[brand.trim().toLowerCase()];
}
