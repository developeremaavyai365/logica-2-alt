/* Bundled and run by scripts/export-catalogue.mjs: reads the catalogue built
   into the website (products, details, gallery, colours) and prints it as
   one JSON document for backend/scripts/import-catalogue.js. */

import { categories, products } from '../../src/data';
import { PRODUCT_DETAILS } from '../../src/product-details-data';
import { PRODUCT_GALLERY } from '../../src/product-gallery-data';
import { PRODUCT_COLOURS } from '../../src/product-colours';

const seed = {
  categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
  products: products.map((p, position) => ({
    ...p,
    position,
    details: PRODUCT_DETAILS[p.id] ?? null,
    gallery: PRODUCT_GALLERY[p.id] ?? [],
    colours: PRODUCT_COLOURS[p.id] ?? null,
  })),
};

process.stdout.write(JSON.stringify(seed, null, 1));
