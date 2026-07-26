const fs = require('fs');
const path = require('path');

const srcPath = path.join('C:', 'Users', 'DELL', 'Desktop', 'logica', 'lib', 'catalog-data.ts');
const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('[');
const end = src.lastIndexOf(']');
const arrText = src.slice(start, end + 1);
const arr = eval(arrText);

function decode(s) {
  return s
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&#8243;/g, '"')
    .replace(/&amp;/g, '&');
}

const cleaned = arr.map((p) => ({
  id: p.id,
  name: decode(p.name),
  brand: p.brand,
  category: p.category,
  price: p.price,
  mrp: p.mrp,
  image: p.image,
  inStock: p.inStock,
}));

const out =
  'export type Product = {\n' +
  '  id: string;\n' +
  '  name: string;\n' +
  '  brand: string;\n' +
  '  category: string;\n' +
  '  price: number;\n' +
  '  mrp?: number;\n' +
  '  image: string;\n' +
  '  inStock: boolean;\n' +
  '};\n\n' +
  'export const products: Product[] = ' + JSON.stringify(cleaned, null, 2) + ';\n';

fs.writeFileSync(path.join(__dirname, '..', 'src', 'products-data.ts'), out);
console.log('wrote', cleaned.length, 'products');
