import { PRODUCT_GALLERY } from './product-gallery-data';

/** The colours a product comes in, each with its own photos.
 *
 *  A product with an entry here gets colour tiles on its page: choosing one
 *  swaps the gallery to that colour's photos, puts the colour in the URL
 *  (`?colour=blue`, so a link or a search can open on it), and carries it
 *  into the cart. A product without an entry is shown as before.
 *
 *  Which colours are listed: the ones the product's own photos show (each
 *  phone's photo set includes the maker's line-up), under the maker's names
 *  for them. A colour with `images` has photos of its own; one without is
 *  pictured only in the line-up, which is what its gallery then shows —
 *  give it photos when there are some. Photos live under
 *  /public/products-gallery/<product id>/, numbered as in
 *  product-gallery-data.ts.
 *
 *  The first colour is the one a page opens on — where the listing's own
 *  name or id names a colour, that one goes first.
 *
 *  Stock per colour: `inStock` left out means "same as the product". Set it
 *  only from real stock — e.g. once the SAP sheet carries one SAP code per
 *  colour. */

export interface ProductColour {
  /** The colour's value in the URL, e.g. "blue". */
  key: string;
  /** The maker's name for the finish, e.g. "Blue", "Midnight". */
  name: string;
  /** Swatch colour. */
  hex: string;
  /** Everyday colour words a shopper might type for this finish — so
   *  "blue" finds Ultramarine and "black" finds Midnight. */
  family: string[];
  /** Photos of this colour only, best first. Empty when the colour appears
   *  only in the line-up photo. */
  images: string[];
  inStock?: boolean;
}

interface ColourSet {
  colours: ProductColour[];
  /** Photos that are not of one colour — line-ups, feature cards, box
   *  contents — shown after a colour's own, line-up first. */
  shared?: string[];
}

/** A colour: key, name, swatch, the words it answers to, and which of the
 *  product's numbered gallery photos show it. */
const c = (key: string, name: string, hex: string, family: string[], photos: number[] = []) => ({
  key,
  name,
  hex,
  family,
  photos,
});

type ColourDef = ReturnType<typeof c>;

/** Builds a product's colour set from photo numbers in its gallery (1 is the
 *  first photo in product-gallery-data.ts, which holds the exact file names). */
function set(productId: string, colours: ColourDef[], shared: number[] = []): ColourSet {
  const gallery = PRODUCT_GALLERY[productId] ?? [];
  const photos = (numbers: number[]) => numbers.map((n) => gallery[n - 1]).filter((src): src is string => !!src);
  return {
    colours: colours.map(({ photos: numbers, ...rest }) => ({ ...rest, images: photos(numbers) })),
    shared: photos(shared),
  };
}

// Swatches shared by several models.
const APPLE_15 = {
  black: c('black', 'Black', '#3B3D3F', ['black']),
  blue: c('blue', 'Blue', '#C9DCE6', ['blue']),
  green: c('green', 'Green', '#D9E6D2', ['green']),
  yellow: c('yellow', 'Yellow', '#F4EDC6', ['yellow']),
  pink: c('pink', 'Pink', '#F2D7DB', ['pink']),
};
const APPLE_14_PRO = {
  spaceBlack: c('space-black', 'Space Black', '#403E3D', ['black', 'grey', 'gray']),
  silver: c('silver', 'Silver', '#F0F2F2', ['silver', 'white']),
  gold: c('gold', 'Gold', '#F4E8CE', ['gold', 'yellow']),
  deepPurple: c('deep-purple', 'Deep Purple', '#594F63', ['purple', 'violet']),
};
const S22 = {
  green: c('green', 'Green', '#2F4B42', ['green']),
  black: c('phantom-black', 'Phantom Black', '#2A2A2C', ['black']),
  white: c('phantom-white', 'Phantom White', '#F2F2F2', ['white']),
  burgundy: c('burgundy', 'Burgundy', '#5A2A2E', ['burgundy', 'red', 'maroon']),
};
const withPhotos = (def: ColourDef, photos: number[]) => ({ ...def, photos });

const DEFS: Record<string, ColourSet> = {
  /* ---------------------------------------------------------- iPhone */
  'iphone-16-128gb-256-gb-512-gb': set(
    'iphone-16-128gb-256-gb-512-gb',
    [
      c('black', 'Black', '#3C3C3E', ['black']),
      c('teal', 'Teal', '#B0D4D2', ['teal', 'green']),
      c('white', 'White', '#F5F5F2', ['white']),
      c('ultramarine', 'Ultramarine', '#9AADF6', ['blue', 'ultramarine']),
    ],
    [1],
  ),
  'apple-iphone-15-pro': set(
    'apple-iphone-15-pro',
    [
      c('black-titanium', 'Black Titanium', '#3B3B3D', ['black', 'titanium']),
      c('white-titanium', 'White Titanium', '#F0EFEB', ['white', 'titanium']),
      c('blue-titanium', 'Blue Titanium', '#3F4A5A', ['blue', 'titanium']),
      c('natural-titanium', 'Natural Titanium', '#BAB4A9', ['natural', 'titanium', 'grey', 'gray']),
    ],
    [1],
  ),
  'apple-iphone-15-plus-128-gb': set(
    'apple-iphone-15-plus-128-gb',
    [withPhotos(APPLE_15.black, [2, 3]), withPhotos(APPLE_15.blue, [4]), APPLE_15.green, APPLE_15.yellow, APPLE_15.pink],
    [1, 6],
  ),
  // The listing's id names black and blue — the two with photos of their own.
  'apple-iphone-15-128-gb-black-blue': set(
    'apple-iphone-15-128-gb-black-blue',
    [withPhotos(APPLE_15.black, [6]), withPhotos(APPLE_15.blue, [3, 4, 5]), APPLE_15.green, APPLE_15.yellow, APPLE_15.pink],
    [1, 2],
  ),
  'apple-iphone-14-pro-max': set(
    'apple-iphone-14-pro-max',
    [APPLE_14_PRO.spaceBlack, APPLE_14_PRO.silver, withPhotos(APPLE_14_PRO.gold, [2, 3, 4]), APPLE_14_PRO.deepPurple],
    [1],
  ),
  'apple-iphone-14-pro': set(
    'apple-iphone-14-pro',
    [withPhotos(APPLE_14_PRO.spaceBlack, [1, 2]), APPLE_14_PRO.silver, APPLE_14_PRO.gold, APPLE_14_PRO.deepPurple],
    [4, 3],
  ),
  'apple-iphone-14-plus': set(
    'apple-iphone-14-plus',
    [
      c('midnight', 'Midnight', '#222930', ['black', 'midnight']),
      c('starlight', 'Starlight', '#F2EDE6', ['white', 'starlight', 'cream']),
      c('purple', 'Purple', '#E5DDEA', ['purple', 'lavender']),
      c('red', '(PRODUCT)RED', '#E11C2A', ['red']),
      c('blue', 'Blue', '#A8C1D9', ['blue'], [2, 3, 4]),
    ],
    [1],
  ),
  'iphone-14': set('iphone-14', [c('red', '(PRODUCT)RED', '#E11C2A', ['red'], [1, 2, 3])]),
  'apple-iphone-13-128gb': set('apple-iphone-13-128gb', [c('midnight', 'Midnight', '#232A31', ['black', 'midnight'], [1, 2, 3, 4])]),

  /* --------------------------------------------------------- Samsung */
  'samsung-galaxy-s25-ultra-5g': set(
    'samsung-galaxy-s25-ultra-5g',
    [
      c('titanium-gray', 'Titanium Gray', '#BDB7AE', ['grey', 'gray', 'titanium']),
      c('titanium-silverblue', 'Titanium Silverblue', '#C5CCD9', ['blue', 'silver', 'titanium']),
      c('titanium-black', 'Titanium Black', '#3A3B3D', ['black', 'titanium']),
      c('titanium-whitesilver', 'Titanium Whitesilver', '#E8E9EC', ['white', 'silver', 'titanium']),
    ],
    [1],
  ),
  'samsung-galaxy-s24-ultra-5g-2': set(
    'samsung-galaxy-s24-ultra-5g-2',
    [
      c('titanium-gray', 'Titanium Gray', '#A9A49C', ['grey', 'gray', 'titanium']),
      c('titanium-black', 'Titanium Black', '#3E3E3E', ['black', 'titanium']),
      c('titanium-violet', 'Titanium Violet', '#4A4458', ['violet', 'purple', 'titanium']),
      c('titanium-yellow', 'Titanium Yellow', '#EDE3B8', ['yellow', 'gold', 'titanium']),
    ],
    [1],
  ),
  // Listed as "Galaxy S24 5G" despite the id.
  'samsung-galaxy-s24-ultra-5g': set(
    'samsung-galaxy-s24-ultra-5g',
    [
      c('marble-grey', 'Marble Grey', '#E3E3E3', ['grey', 'gray', 'white', 'silver']),
      c('onyx-black', 'Onyx Black', '#2E2E30', ['black']),
      c('cobalt-violet', 'Cobalt Violet', '#5B4F8E', ['violet', 'purple', 'blue']),
    ],
    [1],
  ),
  'samsung-galaxy-s22-ultra-5g': set('samsung-galaxy-s22-ultra-5g', [S22.green, S22.black, S22.burgundy], [1]),
  // The listing's name says Burgundy.
  'samsung-galaxy-s22-ultra-5g-12gb-ram-256gb': set('samsung-galaxy-s22-ultra-5g-12gb-ram-256gb', [
    withPhotos(S22.burgundy, [1, 2]),
    withPhotos(S22.black, [3]),
    withPhotos(S22.white, [4]),
  ]),
  // The listing's name says Green.
  'samsung-galaxy-s22-plus-5g-8gb-ram-256gb': set('samsung-galaxy-s22-plus-5g-8gb-ram-256gb', [
    withPhotos(S22.green, [1, 2]),
    withPhotos(S22.black, [3]),
    withPhotos(S22.white, [4]),
  ]),
  // The listing's name says Green.
  'samsung-galaxy-s22-5g-green': set('samsung-galaxy-s22-5g-green', [withPhotos(S22.green, [1, 2, 3]), S22.white, S22.black], [4]),
  'samsung-galaxy-s23-ultra-5g-green': set('samsung-galaxy-s23-ultra-5g-green', [c('green', 'Green', '#5D6B58', ['green'], [1, 2, 3, 4])]),
  'samsung-galaxy-s21-fe-5g': set('samsung-galaxy-s21-fe-5g', [c('graphite', 'Graphite', '#3B3C3E', ['black', 'grey', 'gray', 'graphite'], [1, 2])], [3, 4]),
  'samsung-galaxy-s20-fe-5g-cloud-navy-8gb-ram-128gb-storage': set(
    'samsung-galaxy-s20-fe-5g-cloud-navy-8gb-ram-128gb-storage',
    [c('cloud-navy', 'Cloud Navy', '#2D3A5A', ['blue', 'navy'], [1])],
    [2, 3, 4, 5, 6],
  ),
  'samsung-galaxy-z-fold4-5g-phantom-black-12gb-ram-256gb-storage': set(
    'samsung-galaxy-z-fold4-5g-phantom-black-12gb-ram-256gb-storage',
    [c('phantom-black', 'Phantom Black', '#2A2A2C', ['black'], [1, 2])],
    [3, 4, 5],
  ),
  'samsung-galaxy-z-flip5-5g': set('samsung-galaxy-z-flip5-5g', [c('lavender', 'Lavender', '#D7C7E6', ['lavender', 'purple', 'violet', 'pink'], [1])]),
  'samsung-galaxy-a55-5g': set(
    'samsung-galaxy-a55-5g',
    [
      c('awesome-iceblue', 'Awesome Iceblue', '#C9D6EE', ['blue', 'iceblue', 'light blue']),
      c('awesome-navy', 'Awesome Navy', '#1E2433', ['navy', 'blue', 'black']),
    ],
    [1],
  ),
  'samsung-galaxy-a54-5g-8gb-ram-50-mp-no-shake-cam-ois-ip67-gorilla-glass-5-voice-focus': set(
    'samsung-galaxy-a54-5g-8gb-ram-50-mp-no-shake-cam-ois-ip67-gorilla-glass-5-voice-focus',
    [
      c('awesome-violet', 'Awesome Violet', '#A79BE6', ['violet', 'purple'], [2, 3, 4]),
      c('awesome-lime', 'Awesome Lime', '#E0EFB5', ['lime', 'green']),
      c('awesome-graphite', 'Awesome Graphite', '#34363A', ['graphite', 'black', 'grey', 'gray']),
    ],
    [1],
  ),
  'samsung-galaxy-a16-5g': set(
    'samsung-galaxy-a16-5g',
    [
      c('blue-black', 'Blue Black', '#233046', ['black', 'blue', 'navy']),
      c('light-green', 'Light Green', '#BFE5DF', ['green', 'mint']),
      c('gold', 'Gold', '#EEE1BE', ['gold', 'yellow']),
    ],
    [1],
  ),
  'samsung-galaxy-a05': set(
    'samsung-galaxy-a05',
    [
      c('light-green', 'Light Green', '#CDE7A8', ['green']),
      c('silver', 'Silver', '#EDEDED', ['silver', 'white']),
      c('black', 'Black', '#23272E', ['black']),
    ],
    [1],
  ),
  'samsung-galaxy-a23-2-4-ghz-infinity-v-display-6gb-8gb-ram-128gb': set(
    'samsung-galaxy-a23-2-4-ghz-infinity-v-display-6gb-8gb-ram-128gb',
    [c('black', 'Black', '#2E2F33', ['black'], [1, 2, 3, 4]), c('light-blue', 'Light Blue', '#BFD6EE', ['blue', 'light blue'], [6])],
    [5],
  ),
  'samsung-galaxy-a03-1-6-ghz-infinity-v-display-3gb-4gb-ram-32gb-64gb': set(
    'samsung-galaxy-a03-1-6-ghz-infinity-v-display-3gb-4gb-ram-32gb-64gb',
    [c('black', 'Black', '#26282B', ['black'], [1, 3, 4]), c('blue', 'Blue', '#2A3A6B', ['blue', 'navy'], [5])],
    [2, 6],
  ),
  'samsung-galaxy-m34-5g': set(
    'samsung-galaxy-m34-5g',
    [
      c('midnight-blue', 'Midnight Blue', '#26304A', ['blue', 'navy', 'black']),
      c('prism-silver', 'Prism Silver', '#E9E3E6', ['silver', 'white']),
      c('waterfall-blue', 'Waterfall Blue', '#7FB8BA', ['blue', 'teal']),
    ],
    [1],
  ),
  'samsung-galaxy-f54-5g': set(
    'samsung-galaxy-f54-5g',
    [c('stardust-silver', 'Stardust Silver', '#DADDE2', ['silver', 'white']), c('meteor-blue', 'Meteor Blue', '#1F2A48', ['blue', 'navy'])],
    [1],
  ),
  'samsung-galaxy-m14-5g': set(
    'samsung-galaxy-m14-5g',
    [
      c('berry-blue', 'Berry Blue', '#1F2C46', ['blue', 'navy']),
      c('icy-silver', 'Icy Silver', '#E6E3EC', ['silver', 'white']),
      c('smoky-teal', 'Smoky Teal', '#5E9C98', ['teal', 'green']),
    ],
    [1],
  ),
};

export const PRODUCT_COLOURS: Record<string, ColourSet> = DEFS;

export function coloursOf(productId: string): ProductColour[] {
  return PRODUCT_COLOURS[productId]?.colours ?? [];
}

/** The colour a `?colour=` value names, if the product comes in it. */
export function findColour(productId: string, key: string | null | undefined): ProductColour | undefined {
  if (!key) return undefined;
  const wanted = key.trim().toLowerCase();
  return coloursOf(productId).find((c) => c.key === wanted);
}

/** Photos for one colour of a product: its own first, then the shared ones. */
export function colourImages(productId: string, colour: ProductColour): string[] {
  return [...colour.images, ...(PRODUCT_COLOURS[productId]?.shared ?? [])];
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A product's name without the colour some listings carry in it
 *  ("…12GB, 256GB, ?Burgundy", "Galaxy S22 5G (Green, 8GB, …)"), for
 *  products whose colour comes from the dots instead. Names of products
 *  without colours are returned as they are. */
export function baseName(product: { id: string; name: string }): string {
  const colours = coloursOf(product.id);
  if (colours.length === 0) return product.name;
  let name = product.name;
  // Longest first, so "Phantom Black" goes before a bare "Black" could.
  for (const colour of [...colours].sort((a, b) => b.name.length - a.name.length)) {
    name = name.replace(new RegExp(`\\??\\b${escapeRegExp(colour.name)}\\b`, 'gi'), '');
  }
  name = name
    .replace(/\(\s*,\s*/g, '(') // "(Green, 8GB" → "(8GB"
    .replace(/\s*,\s*\)/g, ')')
    .replace(/\(\s*\)/g, '')
    .replace(/(\s*,\s*){2,}/g, ', ');
  // Some catalogue names were cut off mid-bracket ("(12GB RAM, 256G"); with
  // the colour following, that reads as broken, so the unclosed part goes.
  const open = name.lastIndexOf('(');
  if (open > 0 && name.indexOf(')', open) === -1) name = name.slice(0, open);
  return name
    .replace(/[\s,?|]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** The name to show for a product: its base name, followed by the colour
 *  when one is chosen — "Apple iPhone 15 Plus – Green". */
export function productTitle(product: { id: string; name: string }, colour?: ProductColour): string {
  const base = baseName(product);
  return colour ? `${base} – ${colour.name}` : base;
}

/** The colour of a product that a word names ("blue", "midnight"), if any.
 *  Its own name wins over a family word, so "blue" picks Blue over Teal. */
export function colourForWord(productId: string, word: string): ProductColour | undefined {
  const w = word.toLowerCase();
  const colours = coloursOf(productId);
  return (
    colours.find((c) => c.key === w || c.name.toLowerCase() === w || c.name.toLowerCase().split(' ').includes(w)) ??
    colours.find((c) => c.family.includes(w))
  );
}
