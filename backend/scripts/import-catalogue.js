/* Loads the website's built-in catalogue into the database: categories,
   brands, products with their specs and photos, and colours.

   Usage (from the backend folder, once per environment):
     node scripts/import-catalogue.js              add products not in the database yet
     node scripts/import-catalogue.js --overwrite  also replace existing ones with the file's version

   The file is prisma/catalogue-seed.json, made from the website's data
   files by `node scripts/export-catalogue.mjs` in the project root.

   Without --overwrite, a product already in the database is left exactly as
   it is, so running this again never undoes edits made in the admin panel. */

const { readFileSync } = require('fs');
const { join } = require('path');
const { PrismaClient, ProductStatus } = require('@prisma/client');

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const paise = (rupees) => (typeof rupees === 'number' ? Math.round(rupees * 100) : null);

/** The database row for one product of the seed file. */
function productData(p, categoryId, brandId) {
  const details = p.details ?? {};
  return {
    name: p.name,
    description: details.overview ?? '',
    categoryId,
    brandId,
    status: ProductStatus.ACTIVE,
    position: p.position,
    priceInPaise: paise(p.price),
    mrpInPaise: paise(p.mrp),
    inStock: p.inStock !== false,
    imageUrl: p.image,
    gallery: p.gallery ?? [],
    sharedImages: p.colours?.shared ?? [],
    highlights: details.highlights ?? [],
    specs: details.specs ?? [],
    attrs: p.attrs ?? undefined,
    rating: p.rating ?? null,
    reviewCount: p.reviews ?? null,
  };
}

const colourRows = (p) =>
  (p.colours?.colours ?? []).map((c, position) => ({
    key: c.key,
    name: c.name,
    hex: c.hex,
    family: c.family ?? [],
    images: c.images ?? [],
    inStock: typeof c.inStock === 'boolean' ? c.inStock : null,
    position,
  }));

async function main() {
  const overwrite = process.argv.includes('--overwrite');
  const seed = JSON.parse(readFileSync(join(__dirname, '../prisma/catalogue-seed.json'), 'utf8'));
  const prisma = new PrismaClient();

  try {
    const categoryIds = new Map();
    for (const c of seed.categories) {
      const row = await prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { slug: c.slug, name: c.name },
      });
      categoryIds.set(c.slug, row.id);
    }

    const brandIds = new Map();
    for (const name of new Set(seed.products.map((p) => p.brand.trim()))) {
      const row = await prisma.brand.upsert({ where: { name }, update: {}, create: { name, slug: slugify(name) } });
      brandIds.set(name, row.id);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const p of seed.products) {
      const categoryId = categoryIds.get(p.category);
      if (!categoryId) {
        console.error(`Skipped ${p.id}: unknown category "${p.category}".`);
        skipped++;
        continue;
      }
      const data = productData(p, categoryId, brandIds.get(p.brand.trim()) ?? null);
      const existing = await prisma.product.findUnique({ where: { slug: p.id }, select: { id: true } });

      if (existing && !overwrite) {
        skipped++;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        if (existing) {
          await tx.product.update({ where: { id: existing.id }, data });
          await tx.productColour.deleteMany({ where: { productId: existing.id } });
          await tx.productColour.createMany({ data: colourRows(p).map((c) => ({ ...c, productId: existing.id })) });
        } else {
          await tx.product.create({ data: { ...data, slug: p.id, colours: { create: colourRows(p) } } });
        }
      });
      if (existing) updated++;
      else created++;
    }

    console.log(
      `Catalogue: ${created} added, ${updated} replaced, ${skipped} left as they were` +
        (skipped && !overwrite ? ' (already in the database; use --overwrite to replace them)' : '') +
        '.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Could not import the catalogue:', err.message);
    process.exit(1);
  });
}

// For the tests, which check the database rows turn back into the website's data.
module.exports = { productData, colourRows };
