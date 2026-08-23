export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  image: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  /** Faceted spec attributes — the scraped catalog has none populated. */
  attrs?: Partial<Record<string, string>>;
};

export const products: Product[] = [
  {
    "id": "hp-laptop14-ep0341tu-silver",
    "name": "HP Laptop14-ep0341TU, Silver",
    "brand": "HP",
    "category": "laptops",
    "price": 50840,
    "mrp": 50842,
    "image": "/products/hp-laptop14-ep0341tu-silver.jpg",
    "inStock": true
  },
  {
    "id": "brother-dcp-t520w-all-in-one-ink-tank-refill-system-solid-ink-printers-with-built-in-wireless-technologyblack",
    "name": "Brother Dcp-T520W All-in One Ink Tank Refill System Sol",
    "brand": "Brother",
    "category": "printers",
    "price": 15190,
    "mrp": 15199,
    "image": "/products/brother-dcp-t520w-all-in-one-ink-tank-refill-system-solid-ink-printers-with-built-in-wireless-technologyblack.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s25-ultra-5g",
    "name": "Samsung Galaxy S25 Ultra 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 129990,
    "image": "/products/samsung-galaxy-s25-ultra-5g.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-slim-1-82r400bgin",
    "name": "Lenovo IdeaPad Slim 1 82R400BGIN",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 35500,
    "mrp": 39990,
    "image": "/products/lenovo-ideapad-slim-1-82r400bgin.jpg",
    "inStock": true
  },
  {
    "id": "vivo-x200-5g",
    "name": "Vivo X200 5G",
    "brand": "Vivo",
    "category": "mobile-phones",
    "price": 74900,
    "image": "/products/vivo-x200-5g.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-slim-3-82rk00vwin-laptop-12th-gen-core-i3-8gb-512gb-ssd-win11",
    "name": "Lenovo IdeaPad Slim 3 82RK00VWIN Laptop (12th Gen Core",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 33100,
    "mrp": 55190,
    "image": "/products/lenovo-ideapad-slim-3-82rk00vwin-laptop-12th-gen-core-i3-8gb-512gb-ssd-win11.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-a16-5g",
    "name": "Samsung Galaxy A16 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 16900,
    "mrp": 19999,
    "image": "/products/samsung-galaxy-a16-5g.jpg",
    "inStock": true
  },
  {
    "id": "iphone-16-128gb-256-gb-512-gb",
    "name": "iPhone 16",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 79899,
    "image": "/products/iphone-16-128gb-256-gb-512-gb.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-a55-5g",
    "name": "Samsung Galaxy A55 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 45990,
    "image": "/products/samsung-galaxy-a55-5g.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-book-4-np750xgj-kg2in-laptop-13th-gen-intel-core-i5-1335u-16gb-512gb-ssd-win11",
    "name": "Samsung Galaxy Book 4 np750xgj-kg2in Laptop (13th Gen I",
    "brand": "Samsung",
    "category": "laptops",
    "price": 81789,
    "mrp": 82789,
    "image": "/products/samsung-galaxy-book-4-np750xgj-kg2in-laptop-13th-gen-intel-core-i5-1335u-16gb-512gb-ssd-win11.jpg",
    "inStock": true
  },
  {
    "id": "oneplus-nord-ce4",
    "name": "OnePlus Nord CE4",
    "brand": "OnePlus",
    "category": "mobile-phones",
    "price": 24990,
    "image": "/products/oneplus-nord-ce4.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-k15-k513ea-l312ws",
    "name": "ASUS VivoBook K15 K513EA-L312WS",
    "brand": "ASUS",
    "category": "laptops",
    "price": 40990,
    "mrp": 62990,
    "image": "/products/asus-vivobook-k15-k513ea-l312ws.jpg",
    "inStock": true
  },
  {
    "id": "honor-x9b-5g",
    "name": "HONOR X9b 5G",
    "brand": "Honor",
    "category": "mobile-phones",
    "price": 28999,
    "mrp": 30999,
    "image": "/products/honor-x9b-5g.jpg",
    "inStock": true
  },
  {
    "id": "apple-iphone-15-pro",
    "name": "Apple iPhone 15 Pro",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 134899,
    "image": "/products/apple-iphone-15-pro.jpg",
    "inStock": true
  },
  {
    "id": "realme-12-pro-5g",
    "name": "realme 12 Pro+ 5G",
    "brand": "realme",
    "category": "mobile-phones",
    "price": 27999,
    "image": "/products/realme-12-pro-5g.jpg",
    "inStock": true
  },
  {
    "id": "asus-tuf-gaming-f15-ai-powered-gaming-laptop-intel-core-i5-11400h-11th-gen-15-6-inch-39-62-cm-fhd-144hz-8gb-512gb-ssd-4gb-nvidia-rtx-2050-win-11-rgb-backlit-black-2-30-kgfx506hf-hn024w",
    "name": "ASUS TUF Gaming F15 – AI Powered Gaming Laptop, Intel",
    "brand": "ASUS",
    "category": "laptops",
    "price": 55990,
    "mrp": 75990,
    "image": "/products/asus-tuf-gaming-f15-ai-powered-gaming-laptop-intel-core-i5-11400h-11th-gen-15-6-inch-39-62-cm-fhd-144hz-8gb-51.jpg",
    "inStock": true
  },
  {
    "id": "hp-laptop-15-amd-ryzen-5-7520u-15-6-inch-39-6-cm-fhd-16gb-lpddr5-512gb-ssd-amd-radeon-graphics-fhd-camera-w-privacy-shutter-backlit-kb-win-11-mso-2021-silver-1-59-kg-fc0030au",
    "name": "HP Laptop 15, AMD Ryzen 5 7520U, 15.6-inch (39.6 cm), F",
    "brand": "HP",
    "category": "laptops",
    "price": 47490,
    "mrp": 57970,
    "image": "/products/hp-laptop-15-amd-ryzen-5-7520u-15-6-inch-39-6-cm-fhd-16gb-lpddr5-512gb-ssd-amd-radeon-graphics-fhd-camera-w-pr.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-14-12th-gen-i5-1235u-14-inch-35-6-cm-fhd-anti-glare-16gb-ddr4-1tb-ssd-intel-iris-xe-graphics-bo-fpr-backlit-kb-win-11mso-natural-silver-1-41-kg-14-dv2153tu",
    "name": "HP Pavilion 14, 12th Gen i5-1235U, 14-inch (35.6 cm) FH",
    "brand": "HP",
    "category": "laptops",
    "price": 70710,
    "mrp": 80596,
    "image": "/products/hp-pavilion-14-12th-gen-i5-1235u-14-inch-35-6-cm-fhd-anti-glare-16gb-ddr4-1tb-ssd-intel-iris-xe-graphics-bo-fp.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-a05",
    "name": "Samsung Galaxy A05",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 10895,
    "image": "/products/samsung-galaxy-a05.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s24-ultra-5g-2",
    "name": "SAMSUNG Galaxy S24 Ultra 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 132999,
    "image": "/products/samsung-galaxy-s24-ultra-5g-2.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s24-ultra-5g",
    "name": "SAMSUNG Galaxy S24 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 79990,
    "image": "/products/samsung-galaxy-s24-ultra-5g.jpg",
    "inStock": true
  },
  {
    "id": "oppo-reno11-pro-5g",
    "name": "OPPO Reno11 Pro 5G",
    "brand": "Oppo",
    "category": "mobile-phones",
    "price": 41999,
    "mrp": 44999,
    "image": "/products/oppo-reno11-pro-5g.jpg",
    "inStock": true
  },
  {
    "id": "vivo-y28-5g",
    "name": "vivo Y28 5G",
    "brand": "Vivo",
    "category": "mobile-phones",
    "price": 14999,
    "image": "/products/vivo-y28-5g.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s22-ultra-5g",
    "name": "Samsung Galaxy S22 Ultra 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 86999,
    "image": "/products/samsung-galaxy-s22-ultra-5g.jpg",
    "inStock": true
  },
  {
    "id": "realme-c67-5g",
    "name": "realme C67 5G",
    "brand": "realme",
    "category": "mobile-phones",
    "price": 14999,
    "image": "/products/realme-c67-5g.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-2023-intel-core-i5-13th-gen-1335u-8-gb-1-tb-ssd-windows-11-home-15-fd0012tu-thin-and-light-laptop-15-6-inch-natural-silver-1-6-kg-with-ms-office",
    "name": "HP 15s (2023) Intel Core i5 13th Gen 1335U – (8 G",
    "brand": "HP",
    "category": "laptops",
    "price": 67247,
    "mrp": 78477,
    "image": "/products/hp-15s-2023-intel-core-i5-13th-gen-1335u-8-gb-1-tb-ssd-windows-11-home-15-fd0012tu-thin-and-light-laptop-15-6-.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-amd-r5-5600h-amd-ryzen-5-hexa-core-16-gb-512-gb-ssd-windows-11-home-m1603qa-mb512ws-laptop-silver-with-ms-office",
    "name": "ASUS Vivobook AMD R5 5600H AMD Ryzen 5 Hexa Core &#8211",
    "brand": "ASUS",
    "category": "laptops",
    "price": 70000,
    "mrp": 74990,
    "image": "/products/asus-vivobook-amd-r5-5600h-amd-ryzen-5-hexa-core-16-gb-512-gb-ssd-windows-11-home-m1603qa-mb512ws-laptop-silve.jpg",
    "inStock": true
  },
  {
    "id": "hp-intel-core-i5-13th-gen-16-gb-512-gb-ssd-windows-11-home-intel-integrated-intel-hd-14-ek1074tu-2-in-1-gaming-laptop-14-inch-silver-with-ms-office",
    "name": "HP Intel Core i5 13th Gen – (16 GB/512 GB SSD/Win",
    "brand": "HP",
    "category": "laptops",
    "price": 82980,
    "mrp": 90486,
    "image": "/products/hp-intel-core-i5-13th-gen-16-gb-512-gb-ssd-windows-11-home-intel-integrated-intel-hd-14-ek1074tu-2-in-1-gaming.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-intel-core-i5-12th-gen-1240p-8-gb-512-gb-ssd-windows-11-home-15s-fq5010tu-thin-and-light-laptop-15-6-inch-natural-silver-1-69-kg-with-ms-office",
    "name": "HP 15s Intel Core i5 12th Gen 1240P – (8 GB/512 G",
    "brand": "HP",
    "category": "laptops",
    "price": 65000,
    "mrp": 68465,
    "image": "/products/hp-15s-intel-core-i5-12th-gen-1240p-8-gb-512-gb-ssd-windows-11-home-15s-fq5010tu-thin-and-light-laptop-15-6-in.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-intel-core-i3-11th-gen-1125g4-8-gb-512-gb-ssd-windows-11-home-14-dy0207tu-thin-and-light-laptop-14-inch-natural-silver-1-52-kg-with-ms-office",
    "name": "HP Pavilion Intel Core i3 11th Gen 1125G4 – (8 GB/512",
    "brand": "HP",
    "category": "laptops",
    "price": 54558,
    "mrp": 63361,
    "image": "/products/hp-pavilion-intel-core-i3-11th-gen-1125g4-8-gb-512-gb-ssd-windows-11-home-14-dy0207tu-thin-and-light-laptop-14.jpg",
    "inStock": true
  },
  {
    "id": "asus-x1502za-intel-core-i5-12th-gen-1235u-8-gb-512-gb-ssd-windows-11-home-x1502za-ej532ws-laptop-15-6-inch-quiet-blue-1-70-kg-with-ms-office",
    "name": "ASUS X1502ZA Intel Core i5 12th Gen 1235U – (8 GB/512",
    "brand": "ASUS",
    "category": "laptops",
    "price": 59000,
    "mrp": 70990,
    "image": "/products/asus-x1502za-intel-core-i5-12th-gen-1235u-8-gb-512-gb-ssd-windows-11-home-x1502za-ej532ws-laptop-15-6-inch-qui.jpg",
    "inStock": true
  },
  {
    "id": "redmi-13c-5g",
    "name": "REDMI 13c 5G",
    "brand": "REDMI",
    "category": "mobile-phones",
    "price": 13000,
    "image": "/products/redmi-13c-5g.jpg",
    "inStock": true
  },
  {
    "id": "redmi-13c-copy",
    "name": "REDMI 13c",
    "brand": "REDMI",
    "category": "mobile-phones",
    "price": 11990,
    "image": "/products/redmi-13c-copy.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-15-amd-ryzen-5-hexa-core-13th-gen-amd-ryzen-5-5625u-8-gb-512-gb-ssd-windows-11-home-15-eh2050au-laptop-15-inch-natural-silver-1-75-kg-with-ms-office",
    "name": "HP Pavilion 15 AMD Ryzen 5 Hexa Core 13th Gen AMD Ryzen",
    "brand": "HP",
    "category": "laptops",
    "price": 52964,
    "mrp": 63500,
    "image": "/products/hp-pavilion-15-amd-ryzen-5-hexa-core-13th-gen-amd-ryzen-5-5625u-8-gb-512-gb-ssd-windows-11-home-15-eh2050au-la.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-m34-5g",
    "name": "SAMSUNG Galaxy M34 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 16970,
    "mrp": 24499,
    "image": "/products/samsung-galaxy-m34-5g.jpg",
    "inStock": true
  },
  {
    "id": "hp-15-fc0025au-laptop-amd-ryzen-3-7320u-8gb-512gb-ssd-win11-home",
    "name": "HP 15-fc0025AU Laptop (AMD Ryzen 3 7320U/ 8GB/ 512GB SS",
    "brand": "HP",
    "category": "laptops",
    "price": 34490,
    "mrp": 50000,
    "image": "/products/hp-15-fc0025au-laptop-amd-ryzen-3-7320u-8gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "asus-rog-strix-g16-2023-g614ju-n3221ws-gaming-laptop-13th-gen-core-i5-16gb-1tb-ssd-win11-6gb-graph",
    "name": "Asus ROG Strix G16 2023 G614JU-N3221WS Gaming Laptop (1",
    "brand": "ASUS",
    "category": "laptops",
    "price": 144590,
    "mrp": 263990,
    "image": "/products/asus-rog-strix-g16-2023-g614ju-n3221ws-gaming-laptop-13th-gen-core-i5-16gb-1tb-ssd-win11-6gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "vivo-t2x-5g",
    "name": "vivo T2x 5G",
    "brand": "Vivo",
    "category": "mobile-phones",
    "price": 13500,
    "image": "/products/vivo-t2x-5g.jpg",
    "inStock": true
  },
  {
    "id": "hp-laptop-15s-fr2515tu-11th-gen-intel-core-i3-1115g4",
    "name": "HP Laptop 15s-fr2515TU 11th Gen Intel Core i3-1115G4, 1",
    "brand": "HP",
    "category": "laptops",
    "price": 38290,
    "mrp": 44500,
    "image": "/products/hp-laptop-15s-fr2515tu-11th-gen-intel-core-i3-1115g4.jpg",
    "inStock": true
  },
  {
    "id": "acer-predator-helios-neo-16-13th-gen-intel-core-i5-windows-11-home-16-gb-512-gb-ssd-nvidia-geforce-rtx-4050-phn16-71-wuxga-display-ips-slimbezel-165hz-dds-2-6-kg-obsidian-black",
    "name": "Acer Predator Helios Neo 16 13th Gen Intel Core i5 (Win",
    "brand": "Acer",
    "category": "laptops",
    "price": 120000,
    "mrp": 129999,
    "image": "/products/acer-predator-helios-neo-16-13th-gen-intel-core-i5-windows-11-home-16-gb-512-gb-ssd-nvidia-geforce-rtx-4050-ph.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-f54-5g",
    "name": "Samsung Galaxy F54 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 26800,
    "mrp": 31999,
    "image": "/products/samsung-galaxy-f54-5g.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-fr4000tu-laptop-11th-gen-core-i5-8gb-512gb-ssd-win11-home",
    "name": "HP 15s-fr4000TU Laptop (11th Gen Core i5/ 8GB/ 512GB SS",
    "brand": "HP",
    "category": "laptops",
    "price": 48690,
    "mrp": 60598,
    "image": "/products/hp-15s-fr4000tu-laptop-11th-gen-core-i5-8gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-m14-5g",
    "name": "SAMSUNG Galaxy M14 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 13380,
    "image": "/products/samsung-galaxy-m14-5g.jpg",
    "inStock": true
  },
  {
    "id": "acer-predator-helios-neo-16-gaming-laptop-phn16-71",
    "name": "Acer Predator Helios Neo 16 Gaming Laptop PHN16-71 | 13",
    "brand": "Acer",
    "category": "laptops",
    "price": 128299,
    "mrp": 129999,
    "image": "/products/acer-predator-helios-neo-16-gaming-laptop-phn16-71.jpg",
    "inStock": true
  },
  {
    "id": "oppo-a78-5g",
    "name": "OPPO A78 5G",
    "brand": "Oppo",
    "category": "mobile-phones",
    "price": 21000,
    "mrp": 21999,
    "image": "/products/oppo-a78-5g.jpg",
    "inStock": true
  },
  {
    "id": "redmi-12-5g",
    "name": "Redmi 12 5G",
    "brand": "Redmi",
    "category": "mobile-phones",
    "price": 13970,
    "image": "/products/redmi-12-5g.jpg",
    "inStock": true
  },
  {
    "id": "realme-11-pro-5g-2",
    "name": "Realme 11 Pro+ 5G",
    "brand": "realme",
    "category": "mobile-phones",
    "price": 28000,
    "image": "/products/realme-11-pro-5g-2.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-fq2738tu-laptop-11th-gen-core-i3-8gb-512gb-ssd-win-11-home",
    "name": "HP 15s-fq2738TU Laptop (11th Gen Core i3/ 8GB/ 512GB SS",
    "brand": "HP",
    "category": "laptops",
    "price": 35490,
    "mrp": 41600,
    "image": "/products/hp-15s-fq2738tu-laptop-11th-gen-core-i3-8gb-512gb-ssd-win-11-home.jpg",
    "inStock": true
  },
  {
    "id": "asus-tuf-gaming-fx706hf-hx018w-f17-ai-powered-gaming-core-i5-11th-gen-11400h-8-gb-512-gb-ssd-windows-11-home-4-gb-graphics-nvidia-geforce-rtx-2050-144-hz-70-w-gaming-laptop-17-3-inch-graphit",
    "name": "ASUS TUF Gaming FX706HF-HX018W F17 – AI Powered G",
    "brand": "ASUS",
    "category": "laptops",
    "price": 61990,
    "mrp": 77990,
    "image": "/products/asus-tuf-gaming-fx706hf-hx018w-f17-ai-powered-gaming-core-i5-11th-gen-11400h-8-gb-512-gb-ssd-windows-11-home-4.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-fq3066tu-celeron-dual-core-n4500-8-gb-512-gb-ssd-windows-11-home-thin-and-light-laptop-15-6-inch-jet-black-1-69-kg-with-ms-office",
    "name": "HP 15s- fq3066TU Celeron Dual Core N4500 – (8 GB/512",
    "brand": "HP",
    "category": "laptops",
    "price": 27890,
    "mrp": 31990,
    "image": "/products/hp-15s-fq3066tu-celeron-dual-core-n4500-8-gb-512-gb-ssd-windows-11-home-thin-and-light-laptop-15-6-inch-jet-bl.jpg",
    "inStock": true
  },
  {
    "id": "hp-victus-15-fb0040ax-gaming-laptop-amd-ryzen-5-5600h-8gb-512gb-ssd-win11-4gb-graph",
    "name": "HP Victus 15-fb0040AX Gaming Laptop (AMD Ryzen 5 5600H/",
    "brand": "HP",
    "category": "laptops",
    "price": 55400,
    "mrp": 76021,
    "image": "/products/hp-victus-15-fb0040ax-gaming-laptop-amd-ryzen-5-5600h-8gb-512gb-ssd-win11-4gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-aero-2023-13-be2048au-ryzen-7-octa-core-7735u-16-gb-1-tb-ssd-windows-11-home-thin-and-light-laptop-13-3-inch-natural-silver-0-97-kg-with-ms-office",
    "name": "HP Pavilion Aero (2023) 13-BE2048AU Ryzen 7 Octa Core 7",
    "brand": "HP",
    "category": "laptops",
    "price": 81290,
    "mrp": 91616,
    "image": "/products/hp-pavilion-aero-2023-13-be2048au-ryzen-7-octa-core-7735u-16-gb-1-tb-ssd-windows-11-home-thin-and-light-laptop.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-16x-k3605vu-mb541ws-laptop-13th-gen-core-i5-16gb-512gb-ssd-win11-home-6gb-graph",
    "name": "Asus Vivobook 16X K3605VU-MB541WS Laptop (13th Gen Core",
    "brand": "ASUS",
    "category": "laptops",
    "price": 155499,
    "mrp": 156000,
    "image": "/products/asus-vivobook-16x-k3605vu-mb541ws-laptop-13th-gen-core-i5-16gb-512gb-ssd-win11-home-6gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-fq5007tu-intel-core-i3-12th-gen-1215u-8-gb-512-gb-ssd-windows-11-home-thin-and-light-laptop-15-6-inch-natural-silver-1-69-kg-with-ms-office",
    "name": "HP 15s-fq5007TU Intel Core i3 12th Gen 1215U – (8",
    "brand": "HP",
    "category": "laptops",
    "price": 40990,
    "mrp": 56260,
    "image": "/products/hp-15s-fq5007tu-intel-core-i3-12th-gen-1215u-8-gb-512-gb-ssd-windows-11-home-thin-and-light-laptop-15-6-inch-n.jpg",
    "inStock": true
  },
  {
    "id": "hp-15-eg3036tu-laptop-13th-gen-core-i7-16gb-1tb-ssd-win11-home",
    "name": "HP 15-eg3036TU Laptop (13th Gen Core i7/ 16GB/ 1TB SSD/",
    "brand": "HP",
    "category": "laptops",
    "price": 90490,
    "mrp": 102917,
    "image": "/products/hp-15-eg3036tu-laptop-13th-gen-core-i7-16gb-1tb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-eq2223au-laptop-amd-ryzen-5-5500u-8gb-512gb-ssd-win11-home",
    "name": "HP 15s-eq2223AU Laptop (AMD Ryzen 5 5500U/ 8GB/ 512GB S",
    "brand": "HP",
    "category": "laptops",
    "price": 41480,
    "mrp": 49631,
    "image": "/products/hp-15s-eq2223au-laptop-amd-ryzen-5-5500u-8gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-eq2144au-laptop-ryzen-5-5500u-8gb-512gb-ssd-win11-home",
    "name": "HP 15s-eq2144au Laptop (Ryzen 5 5500U/ 8GB/ 512GB SSD/",
    "brand": "HP",
    "category": "laptops",
    "price": 41890,
    "mrp": 54551,
    "image": "/products/hp-15s-eq2144au-laptop-ryzen-5-5500u-8gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "dell-d560896win9b-core-i3-12th-gen-1215u-8-gb-512-gb-ssd-windows-11-home-new-inspiron-15-laptop-thin-and-light-laptop-38-cm-carbon-black-1-65-kg-with-ms-office",
    "name": "DELL D560896WIN9B Core i3 12th Gen 1215U – (8 GB/512",
    "brand": "Dell",
    "category": "laptops",
    "price": 40290,
    "mrp": 62499,
    "image": "/products/dell-d560896win9b-core-i3-12th-gen-1215u-8-gb-512-gb-ssd-windows-11-home-new-inspiron-15-laptop-thin-and-light.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-15s-fq5112tu-intel-core-i5-12th-gen-1235u-16-gb-512-gb-ssd-windows-11-home-thin-and-light-laptop-15-6-inch-jet-black-1-69-kg-with-ms-office",
    "name": "HP 15s 15s-fq5112TU Intel Core i5 12th Gen 1235U – (1",
    "brand": "HP",
    "category": "laptops",
    "price": 59380,
    "mrp": 72210,
    "image": "/products/hp-15s-15s-fq5112tu-intel-core-i5-12th-gen-1235u-16-gb-512-gb-ssd-windows-11-home-thin-and-light-laptop-15-6-i.jpg",
    "inStock": true
  },
  {
    "id": "hp-ryzen-3-dual-core-3rd-gen-15s-eq1550au-8-gb-512-gb-ssd-windows-11-home-laptop-15-6-inch-silver-with-ms-office",
    "name": "HP Ryzen 3 Dual Core 3rd Gen 15S-EQ1550AU – (8 GB",
    "brand": "HP",
    "category": "laptops",
    "price": 31890,
    "mrp": 40999,
    "image": "/products/hp-ryzen-3-dual-core-3rd-gen-15s-eq1550au-8-gb-512-gb-ssd-windows-11-home-laptop-15-6-inch-silver-with-ms-offi.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-x1500ea-ej3381ws-15-core-i3-11th-gen-i3-1115g4-8-gb-512-gb-ssd-windows-11-home-laptop",
    "name": "ASUS Vivobook X1500EA-EJ3381WS 15 Core i3 11th Gen i3-1",
    "brand": "ASUS",
    "category": "laptops",
    "price": 39000,
    "mrp": 51990,
    "image": "/products/asus-vivobook-x1500ea-ej3381ws-15-core-i3-11th-gen-i3-1115g4-8-gb-512-gb-ssd-windows-11-home-laptop.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-tab-s9-11-inch",
    "name": "Samsung Galaxy Tab S9 (11 inch)",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 72999,
    "image": "/products/samsung-galaxy-tab-s9-11-inch.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-tab-a9-8-7-inch",
    "name": "Samsung Galaxy Tab A9 (8.7 inch)",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 13999,
    "mrp": 14999,
    "image": "/products/samsung-galaxy-tab-a9-8-7-inch.jpg",
    "inStock": true
  },
  {
    "id": "honor-90-5g",
    "name": "Honor 90 5G",
    "brand": "Honor",
    "category": "mobile-phones",
    "price": 34000,
    "image": "/products/honor-90-5g.jpg",
    "inStock": true
  },
  {
    "id": "dell-inspiron-3520-in3520p9k46001orb1-15-6-inch-fhd-120hz-display-core-i3-12th-gen-512gb-ssd-8gb-ddr4-ram",
    "name": "Dell Inspiron 3520 IN3520P9K46001ORB1 15.6 inch FHD 120",
    "brand": "Dell",
    "category": "laptops",
    "price": 38148,
    "mrp": 56000,
    "image": "/products/dell-inspiron-3520-in3520p9k46001orb1-15-6-inch-fhd-120hz-display-core-i3-12th-gen-512gb-ssd-8gb-ddr4-ram.jpg",
    "inStock": true
  },
  {
    "id": "asus-gt-x515ma-br022ws-thin-and-light-laptop-8gb-512gb-ssd-integrated-graphics-windows-11-office-2021-1-8-kg",
    "name": "ASUS GT-X515MA-BR022WS Thin and Light Laptop (8GB/512GB",
    "brand": "ASUS",
    "category": "laptops",
    "price": 28628,
    "mrp": 38990,
    "image": "/products/asus-gt-x515ma-br022ws-thin-and-light-laptop-8gb-512gb-ssd-integrated-graphics-windows-11-office-2021-1-8-kg.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-15-x1500ea-ej3379ws",
    "name": "ASUS VivoBook 15 X1500EA-EJ3379WS Intel Core i3 1115G4",
    "brand": "ASUS",
    "category": "laptops",
    "price": 38690,
    "mrp": 51990,
    "image": "/products/asus-vivobook-15-x1500ea-ej3379ws.jpg",
    "inStock": true
  },
  {
    "id": "hp-core-i5-12th-gen-8-gb-8-gb-ssd-windows-11-home-intel-integrated-intel-hd-15-fa1124tx-gaming-laptop-15-6-inch",
    "name": "HP 15-fa1124TX Core i5 12th Gen – (8 GB/8 GB SSD/Wind",
    "brand": "HP",
    "category": "laptops",
    "price": 62500,
    "mrp": 77900,
    "image": "/products/hp-core-i5-12th-gen-8-gb-8-gb-ssd-windows-11-home-intel-integrated-intel-hd-15-fa1124tx-gaming-laptop-15-6-inc.jpg",
    "inStock": true
  },
  {
    "id": "apple-iphone-15-plus-128-gb",
    "name": "Apple iPhone 15 Plus",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 89999,
    "image": "/products/apple-iphone-15-plus-128-gb.jpg",
    "inStock": true
  },
  {
    "id": "dell-d560874win9b-core-i5-12th-gen-1235u-8-gb-1-tb-hdd-256-gb-ssd-windows-11-home-new-inspiron-15-laptop-thin-and-light-laptop-15-6-inch-carbon-black-1-65-kg-with-ms-office",
    "name": "Dell D560874WIN9B Core i5 12th Gen 1235U – (8 GB/1 TB",
    "brand": "Dell",
    "category": "laptops",
    "price": 63990,
    "mrp": 70000,
    "image": "/products/dell-d560874win9b-core-i5-12th-gen-1235u-8-gb-1-tb-hdd-256-gb-ssd-windows-11-home-new-inspiron-15-laptop-thin-.jpg",
    "inStock": true
  },
  {
    "id": "oneplus-nord-ce-3-lite-5g-8gb-ram-256gb-storage",
    "name": "OnePlus Nord CE 3 Lite 5G 8GB RAM, 256GB Storage",
    "brand": "OnePlus",
    "category": "mobile-phones",
    "price": 21980,
    "mrp": 21999,
    "image": "/products/oneplus-nord-ce-3-lite-5g-8gb-ram-256gb-storage.jpg",
    "inStock": true
  },
  {
    "id": "redmi-note-12-5g",
    "name": "REDMI Note 12 5G",
    "brand": "Mi",
    "category": "mobile-phones",
    "price": 16499,
    "image": "/products/redmi-note-12-5g.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-slim-3-82h803b6in-laptop-11th-gen-core-i7-16gb-512gb-ssd-win11-2",
    "name": "Lenovo IdeaPad Slim 3 82H803B6IN Laptop (11th Gen Core",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 62000,
    "mrp": 64990,
    "image": "/products/lenovo-ideapad-slim-3-82h803b6in-laptop-11th-gen-core-i7-16gb-512gb-ssd-win11-2.jpg",
    "inStock": true
  },
  {
    "id": "dell-inspiron-d560776win9s-core-i5-12th-gen-1235u-16-gb-512-gb-ssd-windows-11-home-inspiron-7420-2-in-1-laptop-14-inch-platinum-silver-1-57-kg-with-ms-office",
    "name": "DELL Inspiron D560776WIN9S Core i5 12th Gen 1235U – (",
    "brand": "DELL",
    "category": "laptops",
    "price": 82490,
    "mrp": 100000,
    "image": "/products/dell-inspiron-d560776win9s-core-i5-12th-gen-1235u-16-gb-512-gb-ssd-windows-11-home-inspiron-7420-2-in-1-laptop.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-slim-3-core-i5-11th-gen-1135g7-8-gb-512-gb-ssd-windows-11-home-15itl6-thin-and-light-laptop-15-6-inch-arctic-grey-1-65-kg-with-ms-office",
    "name": "Lenovo IdeaPad Slim 3 Core i5 11th Gen 1135G7 – (",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 46500,
    "mrp": 64290,
    "image": "/products/lenovo-ideapad-slim-3-core-i5-11th-gen-1135g7-8-gb-512-gb-ssd-windows-11-home-15itl6-thin-and-light-laptop-15-.jpg",
    "inStock": true
  },
  {
    "id": "dell-vostro-3420-business-laptop-core-i5-11th-gen-8-gb-512-gb-ssd-windows-11-home-3420-business-laptop-14-inch-grey-silver-with-ms-office",
    "name": "DELL Vostro D552339WIN9S 3420 Business Laptop Core i5 1",
    "brand": "Dell",
    "category": "laptops",
    "price": 49990,
    "mrp": 69210,
    "image": "/products/dell-vostro-3420-business-laptop-core-i5-11th-gen-8-gb-512-gb-ssd-windows-11-home-3420-business-laptop-14-inch.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-3-82h802l3in-laptop-11th-gen-core-i3-8gb-512gb-ssd-win11-home",
    "name": "Lenovo IdeaPad 3 82H802L3IN Laptop (11th Gen Core i3/ 8",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 46500,
    "mrp": 53290,
    "image": "/products/lenovo-ideapad-3-82h802l3in-laptop-11th-gen-core-i3-8gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "apple-watch-se-2nd-gen-gps-40-mm-smart-watch-2",
    "name": "Apple Watch SE (2nd Gen) [GPS 40 mm] Smart Watch",
    "brand": "Apple",
    "category": "accessories",
    "price": 29899,
    "mrp": 29900,
    "image": "/products/apple-watch-se-2nd-gen-gps-40-mm-smart-watch-2.jpg",
    "inStock": true
  },
  {
    "id": "apple-watch-series-8-gps-cellular-45mm-midnight-aluminium-case-with-midnight-sport-band-regular",
    "name": "Apple Watch Series 8 GPS + Cellular 45mm Midnight Alumi",
    "brand": "Apple",
    "category": "accessories",
    "price": 47433,
    "mrp": 48900,
    "image": "/products/apple-watch-series-8-gps-cellular-45mm-midnight-aluminium-case-with-midnight-sport-band-regular.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-z-flip5-5g",
    "name": "Samsung Galaxy Z Flip5 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 101000,
    "image": "/products/samsung-galaxy-z-flip5-5g.jpg",
    "inStock": true
  },
  {
    "id": "dell-inspiron-3511-d560783win9bd-laptop-11th-gen-core-i3-8gb-512gb-ssd-win11-home",
    "name": "Dell Inspiron 3511 D560783WIN9BD Laptop (11th Gen Core",
    "brand": "Dell",
    "category": "laptops",
    "price": 48590,
    "mrp": 60458,
    "image": "/products/dell-inspiron-3511-d560783win9bd-laptop-11th-gen-core-i3-8gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-slim-3i-82x70032in-laptop-13th-gen-core-i3-8gb-512gb-ssd-win11-home",
    "name": "Lenovo IdeaPad Slim 3i 82X70032IN Laptop (13th Gen Core",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 50000,
    "mrp": 53390,
    "image": "/products/lenovo-ideapad-slim-3i-82x70032in-laptop-13th-gen-core-i3-8gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "oneplus-10r-5g",
    "name": "OnePlus 10R 5G",
    "brand": "OnePlus",
    "category": "mobile-phones",
    "price": 30000,
    "mrp": 38999,
    "image": "/products/oneplus-10r-5g.jpg",
    "inStock": true
  },
  {
    "id": "oneplus-11r-5g",
    "name": "OnePlus 11R 5G",
    "brand": "OnePlus",
    "category": "mobile-phones",
    "price": 39990,
    "image": "/products/oneplus-11r-5g.jpg",
    "inStock": true
  },
  {
    "id": "hp-laptop-39-6-cm-15s-fq5185tu",
    "name": "HP Laptop 39.6 cm 15s-fq5185TU",
    "brand": "HP",
    "category": "laptops",
    "price": 42999,
    "mrp": 45999,
    "image": "/products/hp-laptop-39-6-cm-15s-fq5185tu.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-14-dv2015tu-laptop-12th-gen-core-i7-16gb-1tb-ssd-win-11",
    "name": "HP Pavilion 14-dv2015TU Laptop (12th Gen Core i7/ 16GB/",
    "brand": "HP",
    "category": "laptops",
    "price": 90000,
    "mrp": 104048,
    "image": "/products/hp-pavilion-14-dv2015tu-laptop-12th-gen-core-i7-16gb-1tb-ssd-win-11.jpg",
    "inStock": true
  },
  {
    "id": "apple-watch-series-9-gps-cellular-45mm-smartwatch-aluminum-case-with-s-m-fitness-tracker-blood-oxygen-ecg-apps-always-on-retina-display-water-resistant",
    "name": "Apple Watch Series 9 [GPS + Cellular 45mm] Smartwatch A",
    "brand": "Apple",
    "category": "accessories",
    "price": 51899,
    "mrp": 51900,
    "image": "/products/apple-watch-series-9-gps-cellular-45mm-smartwatch-aluminum-case-with-s-m-fitness-tracker-blood-oxygen-ecg-apps.jpg",
    "inStock": true
  },
  {
    "id": "oneplus-nord-ce-2-lite-5g",
    "name": "OnePlus Nord CE 2 Lite 5G",
    "brand": "OnePlus",
    "category": "mobile-phones",
    "price": 19000,
    "mrp": 19999,
    "image": "/products/oneplus-nord-ce-2-lite-5g.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-gaming-3-15ach6-82k2022yin-laptop-amd-ryzen-5-5600h-8gb-512gb-ssd-win11-home-4gb-graph",
    "name": "Lenovo IdeaPad Gaming 3 15ACH6 82K2022YIN Laptop (AMD R",
    "brand": "ASUS",
    "category": "laptops",
    "price": 60000,
    "mrp": 68811,
    "image": "/products/lenovo-ideapad-gaming-3-15ach6-82k2022yin-laptop-amd-ryzen-5-5600h-8gb-512gb-ssd-win11-home-4gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "apple-iphone-15-128-gb-black-blue",
    "name": "Apple iPhone 15 (128 GB)",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 90000,
    "mrp": 124483,
    "image": "/products/apple-iphone-15-128-gb-black-blue.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s20-fe-5g-cloud-navy-8gb-ram-128gb-storage",
    "name": "Samsung Galaxy S20 FE 5G (Cloud Navy, 8GB RAM, 128GB St",
    "brand": "Samsung",
    "category": "storage-devices",
    "price": 29799,
    "mrp": 74999,
    "image": "/products/samsung-galaxy-s20-fe-5g-cloud-navy-8gb-ram-128gb-storage.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-gaming-3-82k2022uin",
    "name": "Lenovo IdeaPad Gaming 3-82K2022UIN",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 80000,
    "mrp": 85000,
    "image": "/products/lenovo-ideapad-gaming-3-82k2022uin.jpg",
    "inStock": true
  },
  {
    "id": "asus-tuf-gaming-a15-fa506ihrz-hn112w-laptop-amd-ryzen-5-4600h-8gb-1tb-ssd-win11-home-4gb-graph",
    "name": "Asus TUF Gaming A15 FA506IHRZ-HN112W Laptop (AMD Ryzen",
    "brand": "ASUS",
    "category": "laptops",
    "price": 62000,
    "mrp": 78999,
    "image": "/products/asus-tuf-gaming-a15-fa506ihrz-hn112w-laptop-amd-ryzen-5-4600h-8gb-1tb-ssd-win11-home-4gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-go-14-2023e1404fa-nk321ws-amd-ryzen-3-7320u-14-inch-35-56-cm-fhd-thin-light-laptop-8gb-512gb-ssd-windows-11-office-2021-alexa-built-in-cool-silver-1-38-kg",
    "name": "ASUS Vivobook Go 14 (2023)E1404FA-NK321WS , AMD Ryzen 3",
    "brand": "ASUS",
    "category": "laptops",
    "price": 39990,
    "mrp": 50990,
    "image": "/products/asus-vivobook-go-14-2023e1404fa-nk321ws-amd-ryzen-3-7320u-14-inch-35-56-cm-fhd-thin-light-laptop-8gb-512gb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s22-5g-green",
    "name": "Samsung Galaxy S22 5G (Green, 8GB, 128GB Storage)",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 57299,
    "image": "/products/samsung-galaxy-s22-5g-green.jpg",
    "inStock": true
  },
  {
    "id": "microsoft-office-365-home-for-6-users-12-month-1-year-subscription-windows-mac-ios-android-activation-key-card",
    "name": "Microsoft Office 365 Home for 6 Users, 12 Month/1 Year",
    "brand": "Microsoft",
    "category": "software",
    "price": 4899,
    "mrp": 5899,
    "image": "/products/microsoft-office-365-home-for-6-users-12-month-1-year-subscription-windows-mac-ios-android-activation-key-card.jpg",
    "inStock": true
  },
  {
    "id": "windows-10-pro-32-64-bit-full-verson-single-user-license-english-intl-2023-for-1pc",
    "name": "Windows 10 Pro 32/64 Bit Full Verson Single User Licens",
    "brand": "Microsoft",
    "category": "software",
    "price": 5800,
    "mrp": 10599,
    "image": "/products/windows-10-pro-32-64-bit-full-verson-single-user-license-english-intl-2023-for-1pc.jpg",
    "inStock": true
  },
  {
    "id": "realme-11-pro-5g",
    "name": "realme 11 Pro 5G",
    "brand": "realme",
    "category": "mobile-phones",
    "price": 25000,
    "image": "/products/realme-11-pro-5g.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-pro-15-m6500qc-hn742ws-laptop-ryzen-7-5800h-16gb-512gb-ssd-win11-4gb-graph",
    "name": "Asus Vivobook Pro 15 M6500QC-HN742WS Laptop (Ryzen 7 58",
    "brand": "ASUS",
    "category": "laptops",
    "price": 88000,
    "mrp": 88990,
    "image": "/products/asus-vivobook-pro-15-m6500qc-hn742ws-laptop-ryzen-7-5800h-16gb-512gb-ssd-win11-4gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-14-ec1003au-laptop-ryzen-5-8gb-512gb-ssd-win11-homews-11-home-thin-and-light-laptop-13-3-inch-pale-rose-gold-0-97-kg-with-ms-office-copy",
    "name": "HP Pavilion 14-ec1003AU Laptop (Ryzen 5/ 8GB/ 512GB SSD",
    "brand": "HP",
    "category": "laptops",
    "price": 60000,
    "mrp": 62000,
    "image": "/products/hp-pavilion-14-ec1003au-laptop-ryzen-5-8gb-512gb-ssd-win11-homews-11-home-thin-and-light-laptop-13-3-inch-pale.jpg",
    "inStock": true
  },
  {
    "id": "vivo-y100a-5g",
    "name": "Vivo Y100A 5G",
    "brand": "Vivo",
    "category": "mobile-phones",
    "price": 28000,
    "image": "/products/vivo-y100a-5g.jpg",
    "inStock": true
  },
  {
    "id": "dell-inspiron-3520-laptop-intel-i5-1235u-8gb-512gb-ssd-15-6-39-62cms-fhd-wva-ag-120hz-250-nits-win-11-mso21-backlit-kb-silver-d560866win9s-1-65kgs",
    "name": "Dell Inspiron 3520 Laptop, Intel i5-1235U, 8GB, 512GB S",
    "brand": "Dell",
    "category": "laptops",
    "price": 60000,
    "mrp": 85000,
    "image": "/products/dell-inspiron-3520-laptop-intel-i5-1235u-8gb-512gb-ssd-15-6-39-62cms-fhd-wva-ag-120hz-250-nits-win-11-mso21-ba.jpg",
    "inStock": true
  },
  {
    "id": "vivo-v29e-5g-8-gb-256gb",
    "name": "Vivo V29e 5G (8 GB, 256GB)",
    "brand": "Vivo",
    "category": "mobile-phones",
    "price": 33000,
    "mrp": 33999,
    "image": "/products/vivo-v29e-5g-8-gb-256gb.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-a54-5g-8gb-ram-50-mp-no-shake-cam-ois-ip67-gorilla-glass-5-voice-focus",
    "name": "Samsung Galaxy A54 5G 8GB RAM | 50 MP No Shake Cam (OIS",
    "brand": "Samsung",
    "category": "storage-devices",
    "price": 38999,
    "image": "/products/samsung-galaxy-a54-5g-8gb-ram-50-mp-no-shake-cam-ois-ip67-gorilla-glass-5-voice-focus.jpg",
    "inStock": true
  },
  {
    "id": "asus-rog-strix-g15-amd-ryzen-7-6800h-include-rog-impact-mouse-mat-15-639-62-cm-fhd-144hz-4gb-rtx-3050-gpu-gaming-laptop-16gb-1tb-ssd-win11-office-21-2-1-kgg513rc-hn085ws",
    "name": "ASUS ROG Strix G15, AMD Ryzen 7 6800H, (Include – ROG",
    "brand": "ASUS",
    "category": "laptops",
    "price": 110000,
    "mrp": 152990,
    "image": "/products/asus-rog-strix-g15-amd-ryzen-7-6800h-include-rog-impact-mouse-mat-15-639-62-cm-fhd-144hz-4gb-rtx-3050-gpu-gami.jpg",
    "inStock": true
  },
  {
    "id": "xiaomi-12-pro-5g",
    "name": "Xiaomi 12 Pro 5G 8GB RAM, 256GB, Noir Black",
    "brand": "Mi",
    "category": "mobile-phones",
    "price": 59949,
    "image": "/products/xiaomi-12-pro-5g.jpg",
    "inStock": true
  },
  {
    "id": "hp-smart-tank-525-all-in-one-colour-printer",
    "name": "HP Smart Tank 525 All-in-one Colour Printer",
    "brand": "HP",
    "category": "printers",
    "price": 12000,
    "mrp": 14551,
    "image": "/products/hp-smart-tank-525-all-in-one-colour-printer.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-zeb-u735-ups",
    "name": "ZEBRONICS Zeb-U735 UPS",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 2800,
    "mrp": 3399,
    "image": "/products/zebronics-zeb-u735-ups.jpg",
    "inStock": true
  },
  {
    "id": "apple-iphone-14-pro-max",
    "name": "Apple iPhone 14 Pro Max",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 135599,
    "image": "/products/apple-iphone-14-pro-max.jpg",
    "inStock": true
  },
  {
    "id": "asus-rog-bp1501-39-62-cm-15-6-inch-gaming-laptop-backpack-black",
    "name": "Asus ROG BP1501 39.62 cm (15.6-inch) Gaming Laptop Back",
    "brand": "ASUS",
    "category": "laptop-bags",
    "price": 1399,
    "mrp": 2990,
    "image": "/products/asus-rog-bp1501-39-62-cm-15-6-inch-gaming-laptop-backpack-black.jpg",
    "inStock": true
  },
  {
    "id": "dell-g15-5520-d560822win9b-laptop-core-i5-12th-gen-16-gb-512-gb-ssd-windows-11-4-gb",
    "name": "Dell G15-5520 (D560822WIN9B) Laptop (Core i5 12th Gen/1",
    "brand": "Dell",
    "category": "laptops",
    "price": 76290,
    "mrp": 111383,
    "image": "/products/dell-g15-5520-d560822win9b-laptop-core-i5-12th-gen-16-gb-512-gb-ssd-windows-11-4-gb.jpg",
    "inStock": true
  },
  {
    "id": "hp-victus-16-s0095ax-gaming-laptop-amd-ryzen-7-7840hs-16gb-512b-ssd-win11-6gb-graph",
    "name": "HP Victus 16-s0095AX Gaming Laptop (AMD Ryzen 7 7840HS/",
    "brand": "HP",
    "category": "laptops",
    "price": 85190,
    "mrp": 96136,
    "image": "/products/hp-victus-16-s0095ax-gaming-laptop-amd-ryzen-7-7840hs-16gb-512b-ssd-win11-6gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "dell-inspiron-3520-in3520ktmfjs1orgr1-laptop-11th-gen-core-i3-8gb-512gb-ssd-win11",
    "name": "Dell Inspiron 3520 IN3520KTMFJS1ORGR1 Laptop (11th Gen",
    "brand": "Dell",
    "category": "laptops",
    "price": 40000,
    "mrp": 50054,
    "image": "/products/dell-inspiron-3520-in3520ktmfjs1orgr1-laptop-11th-gen-core-i3-8gb-512gb-ssd-win11.jpg",
    "inStock": true
  },
  {
    "id": "hp-omen-16-xf0060ax-gaming-laptop-amd-ryzen-7-7840hs-16gb-1tb-ssd-win11-8gb-graph",
    "name": "HP Omen 16-xf0060AX Gaming Laptop (AMD Ryzen 7 7840HS/",
    "brand": "HP",
    "category": "laptops",
    "price": 126490,
    "mrp": 148015,
    "image": "/products/hp-omen-16-xf0060ax-gaming-laptop-amd-ryzen-7-7840hs-16gb-1tb-ssd-win11-8gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "p-omen-16-wd0770tx-gaming-laptop-13th-gen-core-i5-16gb-512gb-ssd-win11-home-6gb-graph",
    "name": "HP Omen 16-wd0770TX Gaming Laptop (13th Gen Core i5/ 16",
    "brand": "HP",
    "category": "laptops",
    "price": 106900,
    "mrp": 119380,
    "image": "/products/p-omen-16-wd0770tx-gaming-laptop-13th-gen-core-i5-16gb-512gb-ssd-win11-home-6gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-aero-2023-13-be2056au-ryzen-5-hexa-core-7535u-16-gb-512-gb-ssd-windows-11-home-thin-and-light-laptop-13-3-inch-pale-rose-gold-0-97-kg-with-ms-office",
    "name": "HP Pavilion Aero (2023) 13-BE2056AU Ryzen 5 Hexa Core 7",
    "brand": "HP",
    "category": "laptops",
    "price": 72000,
    "mrp": 80314,
    "image": "/products/hp-pavilion-aero-2023-13-be2056au-ryzen-5-hexa-core-7535u-16-gb-512-gb-ssd-windows-11-home-thin-and-light-lapt.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-15-eg3027tu-laptop-13th-gen-core-i5-16gb-512gb-ssd-win11-home",
    "name": "HP Pavilion 15-eg3027TU Laptop (13th Gen Core i5/ 16GB/",
    "brand": "HP",
    "category": "laptops",
    "price": 80000,
    "mrp": 83700,
    "image": "/products/hp-pavilion-15-eg3027tu-laptop-13th-gen-core-i5-16gb-512gb-ssd-win11-home.jpg",
    "inStock": true
  },
  {
    "id": "hp-victus-15-fa0555tx-laptop-12th-gen-core-i5-16gb-512gb-ssd-win11-home-4gb-graph",
    "name": "HP Victus 15-fa0555TX Laptop (12th Gen Core i5/ 16GB/ 5",
    "brand": "HP",
    "category": "laptops",
    "price": 71590,
    "mrp": 88646,
    "image": "/products/hp-victus-15-fa0555tx-laptop-12th-gen-core-i5-16gb-512gb-ssd-win11-home-4gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "hp-ryzen-5-15-fb1001ax-hexa-core-8-gb-512-gb-ssd-windows-11-home-4-gb-graphics-laptop-15-6-inch-black-with-ms-office",
    "name": "HP Ryzen 5 15-FB1001AX Hexa Core – (8 GB/512 GB SSD/W",
    "brand": "HP",
    "category": "laptops",
    "price": 70000,
    "mrp": 75000,
    "image": "/products/hp-ryzen-5-15-fb1001ax-hexa-core-8-gb-512-gb-ssd-windows-11-home-4-gb-graphics-laptop-15-6-inch-black-with-ms-.jpg",
    "inStock": true
  },
  {
    "id": "hp-laptop-fc0030au-amd-ryzen-5-7520u-15-6-inch-fhd-16gb-lpddr5-512gb-ssd-amd-radeon-graphics-fhd-camera-w-privacy-shutter-backlit-kb-win-11-mso-2021-silver-1-59-kg",
    "name": "HP Laptop fc0030AU, AMD Ryzen 5 7520U, 15.6-inch , FHD,",
    "brand": "HP",
    "category": "laptops",
    "price": 53000,
    "mrp": 60248,
    "image": "/products/hp-laptop-fc0030au-amd-ryzen-5-7520u-15-6-inch-fhd-16gb-lpddr5-512gb-ssd-amd-radeon-graphics-fhd-camera-w-priv.jpg",
    "inStock": true
  },
  {
    "id": "hp-laptop-fc0028au-amd-ryzen-5-7520u-15-6-inch-39-6-cm-fhd-8gb-lpddr5-512gb-ssd-thin-light-amd-radeon-graphics-backlit-kb-dual-speakers-win-11-mso-2021-silver-1-59-kg",
    "name": "HP Laptop fc0028AU AMD Ryzen 5 7520U, 15.6-inch (39.6 c",
    "brand": "HP",
    "category": "laptops",
    "price": 51000,
    "mrp": 55691,
    "image": "/products/hp-laptop-fc0028au-amd-ryzen-5-7520u-15-6-inch-39-6-cm-fhd-8gb-lpddr5-512gb-ssd-thin-light-amd-radeon-graphics.jpg",
    "inStock": true
  },
  {
    "id": "hp-laptop-14s-12th-gen-intel-core-i5-1240p-14-inch-35-6-cm-fhd-8gb-ddr4-512gb-ssd-intel-iris-xe-graphics-backlit-kb-thin-light-dual-speakers-win-11-mso-2021-silver-1-46-kg-dq5007tu",
    "name": "HP Laptop dq5007TU 14s, 12th Gen Intel Core i5-1240P, 1",
    "brand": "HP",
    "category": "laptops",
    "price": 62000,
    "mrp": 71641,
    "image": "/products/hp-laptop-14s-12th-gen-intel-core-i5-1240p-14-inch-35-6-cm-fhd-8gb-ddr4-512gb-ssd-intel-iris-xe-graphics-backl.jpg",
    "inStock": true
  },
  {
    "id": "hp-victus-gaming-laptop-amd-ryzen-5-5600h15-6inch39-6cm-fhd-gaming-laptop-8gb-ram-512gb-ssd-nvidia-geforce-gtx-1650-4gb-gddr6-graphics-backlit-kb-win-11-bo-alexa-xboxpass-15-fb0122ax",
    "name": "HP Victus Gaming Laptop 15-fb0122AX AMD Ryzen 5 5600H,",
    "brand": "HP",
    "category": "laptops",
    "price": 60000,
    "mrp": 69000,
    "image": "/products/hp-victus-gaming-laptop-amd-ryzen-5-5600h15-6inch39-6cm-fhd-gaming-laptop-8gb-ram-512gb-ssd-nvidia-geforce-gtx.jpg",
    "inStock": true
  },
  {
    "id": "hp-ryzen-5-hexa-core-8-gb-512-gb-ssd-windows-11-home-4-gb-graphics-15-fb0147ax-laptop-15-6-inch-blue-with-ms-office",
    "name": "HP Ryzen 15-fb0147AX 5 Hexa Core (8 GB/512 GB SSD/Windo",
    "brand": "HP",
    "category": "laptops",
    "price": 58000,
    "mrp": 63628,
    "image": "/products/hp-ryzen-5-hexa-core-8-gb-512-gb-ssd-windows-11-home-4-gb-graphics-15-fb0147ax-laptop-15-6-inch-blue-with-ms-o.jpg",
    "inStock": true
  },
  {
    "id": "hp-omen-gaming-laptop-16-13th-gen-intel-core-i7-13700hx-16-1-inch-40-9-cm-nvidia-geforce-rtx-4060-fhd-16gb-ddr5-512gb-ssd-rgb-backlit-kb-win-11-mso-2021-black-2-35-kg-wf0055tx",
    "name": "HP OMEN wf0055TX Gaming Laptop 16, 13th Gen Intel Core",
    "brand": "HP",
    "category": "laptops",
    "price": 160000,
    "mrp": 176108,
    "image": "/products/hp-omen-gaming-laptop-16-13th-gen-intel-core-i7-13700hx-16-1-inch-40-9-cm-nvidia-geforce-rtx-4060-fhd-16gb-ddr.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-amd-ryzen-3-5300u-15-6-inch-fhd-anti-glare-display-laptop-15s-eq2213au",
    "name": "HP 15s AMD Ryzen 3 5300U 15.6 inch FHD Anti-Glare Displ",
    "brand": "HP",
    "category": "laptops",
    "price": 38999,
    "mrp": 50565,
    "image": "/products/hp-15s-amd-ryzen-3-5300u-15-6-inch-fhd-anti-glare-display-laptop-15s-eq2213au.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-watch4-classic-lte-4-6cm-black-sm-r895f",
    "name": "Samsung Galaxy Watch4 Classic LTE (4.6cm, Black) SM-R89",
    "brand": "Samsung",
    "category": "accessories",
    "price": 18999,
    "mrp": 42999,
    "image": "/products/samsung-galaxy-watch4-classic-lte-4-6cm-black-sm-r895f.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-buds2-true-wireless-earbuds-noise-cancelling-ambient-sound-bluetooth-lightweight-comfort-fit-touch-control",
    "name": "SAMSUNG Galaxy Buds2 True Wireless Earbuds Noise Cancel",
    "brand": "Samsung",
    "category": "wireless",
    "price": 6899,
    "mrp": 13990,
    "image": "/products/samsung-galaxy-buds2-true-wireless-earbuds-noise-cancelling-ambient-sound-bluetooth-lightweight-comfort-fit-to.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-16-2023-intel-core-i5-13500h-13th-gen-16-inch-fhd-display-x1605va",
    "name": "ASUS Vivobook 16 (2023), Intel Core i5-13500H 13th Gen,",
    "brand": "ASUS",
    "category": "laptops",
    "price": 64899,
    "mrp": 86990,
    "image": "/products/asus-vivobook-16-2023-intel-core-i5-13500h-13th-gen-16-inch-fhd-display-x1605va.jpg",
    "inStock": true
  },
  {
    "id": "hp-victus-12th-gen-intel-core-i7-15-6-inch-fhd-gaming-laptop-15-fa0353tx-16gb-ram-512gb-ssd-rtx-3050-4gb-graphics-144hz-9ms-response-time-win-11-mso-backlit-kb-bo-audio",
    "name": "HP Victus 12th Gen Intel Core i7 15.6 inch FHD Gaming L",
    "brand": "HP",
    "category": "laptops",
    "price": 84999,
    "mrp": 113089,
    "image": "/products/hp-victus-12th-gen-intel-core-i7-15-6-inch-fhd-gaming-laptop-15-fa0353tx-16gb-ram-512gb-ssd-rtx-3050-4gb-graph.jpg",
    "inStock": true
  },
  {
    "id": "hp-victus-gaming-laptop-amd-ryzen-5-5600h-15-6-inch-15-fb0777ax-fhd-ips-gaming-laptop-8gb-ram-512gb-ssd-amd-radeon-rx-6500m-graphics4gb-gddr6-144hz-9ms-response-time-backlit-kb-bo-win-11",
    "name": "HP Victus Gaming Laptop AMD Ryzen 5 5600H 15.6 inch 15-",
    "brand": "HP",
    "category": "laptops",
    "price": 56499,
    "mrp": 77354,
    "image": "/products/hp-victus-gaming-laptop-amd-ryzen-5-5600h-15-6-inch-15-fb0777ax-fhd-ips-gaming-laptop-8gb-ram-512gb-ssd-amd-ra.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-z-fold4-5g-phantom-black-12gb-ram-256gb-storage",
    "name": "Samsung Galaxy Z Fold4 5G Phantom Black (12GB RAM, 256G",
    "brand": "Samsung",
    "category": "storage-devices",
    "price": 154999,
    "image": "/products/samsung-galaxy-z-fold4-5g-phantom-black-12gb-ram-256gb-storage.jpg",
    "inStock": true
  },
  {
    "id": "vivo-v27-pro-5g-smart-phone",
    "name": "Vivo V27 Pro 5G Smart Phone",
    "brand": "Vivo",
    "category": "mobile-phones",
    "price": 37999,
    "image": "/products/vivo-v27-pro-5g-smart-phone.jpg",
    "inStock": true
  },
  {
    "id": "apple-macbook-air-m2-chip-midnight-laptop-mly33hn-a-2022-8gb-ram-256-gb-ssd-13-6-inch-34-46-cm-display-8-core-cpu-8-core-gpu-macos",
    "name": "Apple MacBook Air M2 Chip Midnight Laptop MLY33HN/A (20",
    "brand": "Apple",
    "category": "laptops",
    "price": 114499,
    "mrp": 119900,
    "image": "/products/apple-macbook-air-m2-chip-midnight-laptop-mly33hn-a-2022-8gb-ram-256-gb-ssd-13-6-inch-34-46-cm-display-8-core-.jpeg",
    "inStock": true
  },
  {
    "id": "apple-macbook-air-core-i5-8th-gen-space-grey-mvfj2hn-a",
    "name": "APPLE MacBook Air Core i5 8th Gen Space Grey MVFJ2HN/A",
    "brand": "Apple",
    "category": "laptops",
    "price": 107199,
    "mrp": 119900,
    "image": "/products/apple-macbook-air-core-i5-8th-gen-space-grey-mvfj2hn-a.jpg",
    "inStock": true
  },
  {
    "id": "apple-ipad-10th-generation-wi-fi-mpq13hn-a-2022-model-10-9-inch-64gb-blue",
    "name": "Apple iPad 10th Generation Wi-Fi MPQ13HN/A 2022 Model (",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 43599,
    "mrp": 44900,
    "image": "/products/apple-ipad-10th-generation-wi-fi-mpq13hn-a-2022-model-10-9-inch-64gb-blue.jpg",
    "inStock": true
  },
  {
    "id": "apple-earpods-with-lightning-connector-white-mmtn2zm-a",
    "name": "Apple EarPods with Lightning Connector White MMTN2ZM/A",
    "brand": "Apple",
    "category": "accessories",
    "price": 1649,
    "mrp": 2000,
    "image": "/products/apple-earpods-with-lightning-connector-white-mmtn2zm-a.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s23-ultra-5g-green",
    "name": "Samsung Galaxy S23 Ultra 5G Green",
    "brand": "Samsung",
    "category": "storage-devices",
    "price": 123999,
    "image": "/products/samsung-galaxy-s23-ultra-5g-green.jpeg",
    "inStock": true
  },
  {
    "id": "oneplus-10-pro-5g-volcanic-black-12gb-ram-256gb-storage",
    "name": "OnePlus 10 Pro 5G (Volcanic Black 12GB RAM 256GB Storag",
    "brand": "OnePlus",
    "category": "storage-devices",
    "price": 62999,
    "mrp": 71999,
    "image": "/products/oneplus-10-pro-5g-volcanic-black-12gb-ram-256gb-storage.jpg",
    "inStock": true
  },
  {
    "id": "hp-15s-fr4001tu-core-i5-11th-gen-thin-and-light-laptop",
    "name": "HP 15S-FR4001TU Core i5 11th Gen Thin and Light Laptop",
    "brand": "HP",
    "category": "laptops",
    "price": 54899,
    "mrp": 66599,
    "image": "/products/hp-15s-fr4001tu-core-i5-11th-gen-thin-and-light-laptop.jpg",
    "inStock": true
  },
  {
    "id": "oneplus-nord-2t-5g",
    "name": "OnePlus Nord 2T 5G",
    "brand": "OnePlus",
    "category": "mobile-phones",
    "price": 28999,
    "image": "/products/oneplus-nord-2t-5g.jpg",
    "inStock": true
  },
  {
    "id": "dell-inspiron-3520-d560871win9b-black",
    "name": "Dell Inspiron 3520 D560871WIN9B Black 15-inch Laptop |",
    "brand": "Dell",
    "category": "laptops",
    "price": 54999,
    "mrp": 75649,
    "image": "/products/dell-inspiron-3520-d560871win9b-black.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-slim-1-ryzen-3-7320u-82vg009min",
    "name": "Lenovo IdeaPad Slim 1 Ryzen 3 7320U 15.6? AMD (8GB/512G",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 39499,
    "mrp": 59390,
    "image": "/products/lenovo-ideapad-slim-1-ryzen-3-7320u-82vg009min.jpg",
    "inStock": true
  },
  {
    "id": "hp-slim-desktop-s01-pf2888in-pc",
    "name": "HP Slim Desktop S01-PF2888IN PC",
    "brand": "HP",
    "category": "desktops",
    "price": 39999,
    "mrp": 44256,
    "image": "/products/hp-slim-desktop-s01-pf2888in-pc.jpg",
    "inStock": true
  },
  {
    "id": "apple-iphone-14-pro",
    "name": "Apple iPhone 14 Pro",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 124999,
    "image": "/products/apple-iphone-14-pro.jpg",
    "inStock": true
  },
  {
    "id": "apple-macbook-pro-13-m2-chip",
    "name": "Apple MacBook Pro 13 M2 chip MNEJ3HN/A Laptop (8GB RAM/",
    "brand": "Apple",
    "category": "laptops",
    "price": 137699,
    "mrp": 149900,
    "image": "/products/apple-macbook-pro-13-m2-chip.jpg",
    "inStock": true
  },
  {
    "id": "apple-iphone-14-plus",
    "name": "Apple iPhone 14 Plus",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 81999,
    "image": "/products/apple-iphone-14-plus.jpg",
    "inStock": true
  },
  {
    "id": "iphone-14",
    "name": "Apple iPhone 14",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 72999,
    "image": "/products/iphone-14.jpg",
    "inStock": true
  },
  {
    "id": "apple-iphone-13-128gb",
    "name": "Apple iPhone 13",
    "brand": "Apple",
    "category": "mobile-phones",
    "price": 67899,
    "mrp": 69900,
    "image": "/products/apple-iphone-13-128gb.jpg",
    "inStock": true
  },
  {
    "id": "hp-pavilion-x360-i7",
    "name": "HP Pavilion x360 i7 2-in-1 Convert Laptop, 14-ek0088TU",
    "brand": "HP",
    "category": "laptops",
    "price": 89899,
    "mrp": 104047,
    "image": "/products/hp-pavilion-x360-i7.jpg",
    "inStock": true
  },
  {
    "id": "super-soul-foundation",
    "name": "Super Soul Foundation",
    "brand": "Super",
    "category": "accessories",
    "price": 49,
    "mrp": 50,
    "image": "/products/super-soul-foundation.png",
    "inStock": true
  },
  {
    "id": "lenovo-laptop-bag-15-6-inch-backpack-black-red",
    "name": "Lenovo Laptop Bag 15.6 inch backpack Black Red",
    "brand": "Lenovo",
    "category": "laptop-bags",
    "price": 1100,
    "mrp": 1599,
    "image": "/products/lenovo-laptop-bag-15-6-inch-backpack-black-red.jpg",
    "inStock": true
  },
  {
    "id": "hp-laptop-bag-15-6-inch",
    "name": "HP laptop bag 15.6 inch Black",
    "brand": "HP",
    "category": "laptop-bags",
    "price": 1549,
    "mrp": 1999,
    "image": "/products/hp-laptop-bag-15-6-inch.jpg",
    "inStock": true
  },
  {
    "id": "asus-rog-backpack",
    "name": "Asus ROG Backpack BP1501 Gaming Laptop Bag",
    "brand": "ASUS",
    "category": "laptop-bags",
    "price": 1499,
    "mrp": 2999,
    "image": "/products/asus-rog-backpack.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-zeb-u1200-ups",
    "name": "Zebronics ZEB U1200 UPS",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 4875,
    "mrp": 8999,
    "image": "/products/zebronics-zeb-u1200-ups.jpg",
    "inStock": true
  },
  {
    "id": "microtek-650va-ups",
    "name": "Microtek 650VA UPS",
    "brand": "Microtek",
    "category": "accessories",
    "price": 2599,
    "mrp": 3090,
    "image": "/products/microtek-650va-ups.jpg",
    "inStock": true
  },
  {
    "id": "asus-rog-ryzen7-8gb-512gb-ssd",
    "name": "ASUS ROG Ryzen 7 Octa Core 8GB 512GB SSD 4GB Graphics G",
    "brand": "ASUS",
    "category": "laptops",
    "price": 73999,
    "mrp": 96990,
    "image": "/products/asus-rog-ryzen7-8gb-512gb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "asus-tuf-core-i5-11th-gen-8gb-1tb-ssd",
    "name": "ASUS Core i5 11th Gen 8GB 1TB SSD 4 GB Graphics/NVIDIA",
    "brand": "ASUS",
    "category": "laptops",
    "price": 79999,
    "mrp": 97990,
    "image": "/products/asus-tuf-core-i5-11th-gen-8gb-1tb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "dell-ryzen-3-dual-core-8gb-256gb-ssd",
    "name": "DELL Ryzen 3 Dual Core 8GB 256GB SSD D585054WIN8 Titan",
    "brand": "Dell",
    "category": "laptops",
    "price": 34219,
    "mrp": 48923,
    "image": "/products/dell-ryzen-3-dual-core-8gb-256gb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "hp-675-ink-tank-multi-function-colour-wi-fi-printer",
    "name": "HP 675 Ink Tank Multi-function Colour Wi-Fi Printer",
    "brand": "HP",
    "category": "printers",
    "price": 18099,
    "mrp": 20734,
    "image": "/products/hp-675-ink-tank-multi-function-colour-wi-fi-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-laser-jet-tank-mfp-1005w-printer",
    "name": "HP LaserJet Tank MFP 1005w Printer",
    "brand": "HP",
    "category": "printers",
    "price": 23799,
    "mrp": 27224,
    "image": "/products/hp-laser-jet-tank-mfp-1005w-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-laser-mfp-136a-multi-function-monochrome-laser-printer",
    "name": "HP Laser MFP 136a Multi-function Monochrome Laser Print",
    "brand": "HP",
    "category": "printers",
    "price": 16449,
    "mrp": 19375,
    "image": "/products/hp-laser-mfp-136a-multi-function-monochrome-laser-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-319-inkjet-multi-function-color-usb-printer",
    "name": "HP 319 Inkjet Multi-function Color USB Printer",
    "brand": "HP",
    "category": "printers",
    "price": 13969,
    "mrp": 19000,
    "image": "/products/hp-319-inkjet-multi-function-color-usb-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-ultra-4826-inkjet-multi-function-wi-fi-printer",
    "name": "HP Ultra 4826 Inkjet Multi-function Wi-Fi Printer",
    "brand": "HP",
    "category": "printers",
    "price": 9399,
    "mrp": 11250,
    "image": "/products/hp-ultra-4826-inkjet-multi-function-wi-fi-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-smart-tank-516-wireless-all-in-one-printer",
    "name": "HP Smart Tank 516 Wireless All-in-One Printer",
    "brand": "HP",
    "category": "printers",
    "price": 17049,
    "mrp": 20299,
    "image": "/products/hp-smart-tank-516-wireless-all-in-one-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-deskjet-ink-advantage-2338-all-in-one-printer",
    "name": "HP DeskJet Ink Advantage 2338 All in One Printer",
    "brand": "HP",
    "category": "printers",
    "price": 5399,
    "mrp": 6900,
    "image": "/products/hp-deskjet-ink-advantage-2338-all-in-one-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-deskjet-2332-inkjet-multi-function-color-usb-printer",
    "name": "HP Deskjet 2332 Inkjet Multi-function Color USB Printer",
    "brand": "HP",
    "category": "printers",
    "price": 3999,
    "mrp": 4971,
    "image": "/products/hp-deskjet-2332-inkjet-multi-function-color-usb-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-v20-19-5-inch-hd-plus-monitor",
    "name": "HP V20 19.5 Inch HD Plus Monitor Black",
    "brand": "HP",
    "category": "monitors",
    "price": 7649,
    "mrp": 9394,
    "image": "/products/hp-v20-19-5-inch-hd-plus-monitor.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-d19-10-18-5-inch-wled-monitor",
    "name": "Lenovo D19-10 18.5 Inch WLED Monitor",
    "brand": "Lenovo",
    "category": "monitors",
    "price": 6249,
    "mrp": 11190,
    "image": "/products/lenovo-d19-10-18-5-inch-wled-monitor.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-zeb-vs16hdl-hd-led-backlit-vs16hd-monitor",
    "name": "Zebronics 15.1 inch HD LED Backlit VS16HDL Monitor",
    "brand": "Zebronics",
    "category": "monitors",
    "price": 2899,
    "image": "/products/zebronics-zeb-vs16hdl-hd-led-backlit-vs16hd-monitor.jpg",
    "inStock": true
  },
  {
    "id": "aoc-19-5-inch-led-widescreen-e2070swn-monitor",
    "name": "AOC 19.5 LED Widescreen Monitor E2070SWN Black",
    "brand": "AOC",
    "category": "monitors",
    "price": 6120,
    "mrp": 11999,
    "image": "/products/aoc-19-5-inch-led-widescreen-e2070swn-monitor.jpg",
    "inStock": true
  },
  {
    "id": "acer-18-5-inch-hd-backlit-led-lcd-monitor",
    "name": "Acer EB192Q 18.5-inch IPS LED Monitor Black",
    "brand": "Acer",
    "category": "monitors",
    "price": 7300,
    "mrp": 12000,
    "image": "/products/acer-18-5-inch-hd-backlit-led-lcd-monitor.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-x415ea-eb342ws-core-i3-11th-gen-8gb-ram-256gb-ssd",
    "name": "ASUS Vivobook 14 Core i3-11th Gen 8GB/256GB SSD X415EA-",
    "brand": "ASUS",
    "category": "laptops",
    "price": 36999,
    "mrp": 51990,
    "image": "/products/asus-vivobook-x415ea-eb342ws-core-i3-11th-gen-8gb-ram-256gb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "asus-core-i3-11th-gen-8-gb-256-gb-ssd-k513ea-l303ws-silver",
    "name": "ASUS VivoBook V15 Core i3 11th Gen 8GB/256GB SSD K513EA",
    "brand": "ASUS",
    "category": "laptops",
    "price": 41999,
    "mrp": 58990,
    "image": "/products/asus-core-i3-11th-gen-8-gb-256-gb-ssd-k513ea-l303ws-silver.jpg",
    "inStock": true
  },
  {
    "id": "asus-tuf-fa706icb-hx061w-gaming-ryzen-7-octa-core-8gb-512gb-ssd",
    "name": "ASUS TUF Gaming A17 Ryzen 7 8GB 512GB SSD 4GB Graphics",
    "brand": "ASUS",
    "category": "laptops",
    "price": 75899,
    "mrp": 95990,
    "image": "/products/asus-tuf-fa706icb-hx061w-gaming-ryzen-7-octa-core-8gb-512gb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "asus-tuf-ryzen9-10th-gen-16gb-ram-512gb-ssd",
    "name": "ASUS TUF Ryzen 9 Octa Core 10th Gen 16GB 512GB SSD RTX3",
    "brand": "ASUS",
    "category": "laptops",
    "price": 98649,
    "mrp": 119990,
    "image": "/products/asus-tuf-ryzen9-10th-gen-16gb-ram-512gb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "redmi-note-11",
    "name": "Redmi Note 11, 4GB RAM, 64GB, Horizon Blue",
    "brand": "Redmi",
    "category": "mobile-phones",
    "price": 13227,
    "image": "/products/redmi-note-11.jpg",
    "inStock": true
  },
  {
    "id": "xiaomi-11t-pro-5g-moonlight-white-mobile-phone",
    "name": "Xiaomi 11T Pro 5G Moonlight White Mobile Phone, 8GB RAM",
    "brand": "Mi",
    "category": "storage-devices",
    "price": 36499,
    "mrp": 52999,
    "image": "/products/xiaomi-11t-pro-5g-moonlight-white-mobile-phone.jpeg",
    "inStock": true
  },
  {
    "id": "zebronics-zeb-cronus-premium-gaming-cabinet",
    "name": "Zebronics Zeb-Cronus Premium Gaming Cabinet with Mirror",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 2999,
    "mrp": 3599,
    "image": "/products/zebronics-zeb-cronus-premium-gaming-cabinet.jpg",
    "inStock": true
  },
  {
    "id": "logitech-mk120-wired-combo-keyboard-and-mouse",
    "name": "Logitech MK120 Wired Combo Keyboard and Mouse",
    "brand": "Logitech",
    "category": "accessories",
    "price": 899,
    "mrp": 1399,
    "image": "/products/logitech-mk120-wired-combo-keyboard-and-mouse.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-k35-wired-usb-multi-device-keyboard-black",
    "name": "Zebronics K35 Wired USB Multi Device Keyboard Black",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 389,
    "mrp": 499,
    "image": "/products/zebronics-k35-wired-usb-multi-device-keyboard-black.jpg",
    "inStock": true
  },
  {
    "id": "wd-desktop-internal-hard-disk-drive-1tb",
    "name": "WD Desktop Internal Hard Disk Drive 1TB",
    "brand": "Wd",
    "category": "storage-devices",
    "price": 3259,
    "mrp": 5490,
    "image": "/products/wd-desktop-internal-hard-disk-drive-1tb.jpg",
    "inStock": true
  },
  {
    "id": "samsung-24-inch-fhd-144hz-gaming-monitor",
    "name": "Samsung Curved Full HD LED 24 inch Backlit VA Panel Gam",
    "brand": "Samsung",
    "category": "monitors",
    "price": 14699,
    "mrp": 19990,
    "image": "/products/samsung-24-inch-fhd-144hz-gaming-monitor.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s22-ultra-5g-12gb-ram-256gb",
    "name": "Samsung Galaxy S22 Ultra 5G 12GB, 256GB, ?Burgundy",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 91599,
    "image": "/products/samsung-galaxy-s22-ultra-5g-12gb-ram-256gb.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s22-plus-5g-8gb-ram-256gb",
    "name": "Samsung Galaxy S22 Plus 5G 8GB, 128GB, Green",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 69999,
    "image": "/products/samsung-galaxy-s22-plus-5g-8gb-ram-256gb.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-s21-fe-5g",
    "name": "Samsung Galaxy S21 FE 5G",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 54769,
    "image": "/products/samsung-galaxy-s21-fe-5g.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-a23-2-4-ghz-infinity-v-display-6gb-8gb-ram-128gb",
    "name": "Samsung Galaxy A23 6GB RAM, 128GB Storage 2.4GHz Snapdr",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 17499,
    "image": "/products/samsung-galaxy-a23-2-4-ghz-infinity-v-display-6gb-8gb-ram-128gb.jpg",
    "inStock": true
  },
  {
    "id": "samsung-galaxy-a03-1-6-ghz-infinity-v-display-3gb-4gb-ram-32gb-64gb",
    "name": "Samsung Galaxy A03 3GB, 32GB 1.6 GHz Infinity V Display",
    "brand": "Samsung",
    "category": "mobile-phones",
    "price": 9899,
    "image": "/products/samsung-galaxy-a03-1-6-ghz-infinity-v-display-3gb-4gb-ram-32gb-64gb.jpg",
    "inStock": true
  },
  {
    "id": "hp-smart-tank-530-dual-band-colour-printer",
    "name": "HP Smart Tank 530 Dual Band Colour Printer",
    "brand": "HP",
    "category": "printers",
    "price": 19099,
    "mrp": 22624,
    "image": "/products/hp-smart-tank-530-dual-band-colour-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-laserjet-m126a-bw-printer",
    "name": "HP LaserJet Pro MFP M126a Laser Printer",
    "brand": "HP",
    "category": "printers",
    "price": 18599,
    "mrp": 21499,
    "image": "/products/hp-laserjet-m126a-bw-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-laserjet-108w-laser-printer",
    "name": "HP Laserjet 108w Compact Design Printer",
    "brand": "HP",
    "category": "printers",
    "price": 12999,
    "mrp": 15085,
    "image": "/products/hp-laserjet-108w-laser-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-ink-tank-416-colour-printer",
    "name": "HP Ink Tank 416 Colour Printer",
    "brand": "HP",
    "category": "printers",
    "price": 13899,
    "mrp": 15708,
    "image": "/products/hp-ink-tank-416-colour-printer.jpg",
    "inStock": true
  },
  {
    "id": "hp-ink-tank-316-colour-printer",
    "name": "HP Ink Tank 316 Borderless Printer",
    "brand": "HP",
    "category": "printers",
    "price": 10799,
    "mrp": 11760,
    "image": "/products/hp-ink-tank-316-colour-printer.jpg",
    "inStock": true
  },
  {
    "id": "apple-macbook-air-m1-space-grey-mgn63hn-a",
    "name": "Apple MacBook Air M1 Space Grey MGN63HN/A | Chip 8GB RA",
    "brand": "Apple",
    "category": "laptops",
    "price": 94999,
    "mrp": 99900,
    "image": "/products/apple-macbook-air-m1-space-grey-mgn63hn-a.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-v15-igl-laptop-intel-celeron-n4020-4gb-ram-256gb",
    "name": "Lenovo V15-IGL Intel Celeron N4020/ 4GB RAM/256GB SSD 8",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 27499,
    "mrp": 36000,
    "image": "/products/lenovo-v15-igl-laptop-intel-celeron-n4020-4gb-ram-256gb.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-3-amd-ryzen-5-5500u-laptop-8gb-512gb",
    "name": "Lenovo Ideapad 3 AMD Ryzen 5 5500U 8GB/512GB SSD 82KU01",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 44299,
    "mrp": 68490,
    "image": "/products/lenovo-ideapad-3-amd-ryzen-5-5500u-laptop-8gb-512gb.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-slim-3-chromebook-82c1002eha",
    "name": "Lenovo IdeaPad Slim 3 Chromebook 82C1002EHA – Intel C",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 24799,
    "mrp": 34890,
    "image": "/products/lenovo-ideapad-slim-3-chromebook-82c1002eha.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-yoga-slim-7-11-core-i5-16gb-512gb-ssd",
    "name": "Lenovo Yoga Slim 7 Core i5 16GB/512GB SSD 82A300DFIN Sl",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 75599,
    "mrp": 125890,
    "image": "/products/lenovo-yoga-slim-7-11-core-i5-16gb-512gb-ssd.jpg",
    "inStock": true
  },
  {
    "id": "hp-14s-ryzen-5-5500u-8gb-ram-512gb",
    "name": "HP 14s Ryzen 5-5500U 8GB RAM/512GB SSD 14s-fq1092au, Na",
    "brand": "HP",
    "category": "laptops",
    "price": 47499,
    "mrp": 55691,
    "image": "/products/hp-14s-ryzen-5-5500u-8gb-ram-512gb.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-msc200-cpu-fan",
    "name": "ZEB-MSC200 CPU Fan",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 299,
    "mrp": 499,
    "image": "/products/zebronics-msc200-cpu-fan.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-zeb-companion-107-wireless-keyboard-and-mouse-combo-with-nano-receiver-black",
    "name": "Zebronics Zeb-Companion 107 Wireless Keyboard and Mouse",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 699,
    "mrp": 999,
    "image": "/products/zebronics-zeb-companion-107-wireless-keyboard-and-mouse-combo-with-nano-receiver-black.jpg",
    "inStock": true
  },
  {
    "id": "zebster-monitor-with-hdmi-zeb-v19hd-hdmivga",
    "name": "ZEBSTER LED Monitor 19 Inch with HDMI- ZEB-V19HD (HDMI+",
    "brand": "Zebronics",
    "category": "monitors",
    "price": 3999,
    "mrp": 5599,
    "image": "/products/zebster-monitor-with-hdmi-zeb-v19hd-hdmivga.jpg",
    "inStock": true
  },
  {
    "id": "lenovo-ideapad-5-11th-gen-intel-core-i5-15-6-inch-fhd-laptop-8gb-1tb-256gb-ssd-win-10-office-2019-2gb-graphics-mx450-graphite-grey-1-5kg-82fg0126in",
    "name": "Lenovo Ideapad 5 11th Gen Intel Core i5 15.6-inch FHD L",
    "brand": "Lenovo",
    "category": "laptops",
    "price": 64699,
    "mrp": 99290,
    "image": "/products/lenovo-ideapad-5-11th-gen-intel-core-i5-15-6-inch-fhd-laptop-8gb-1tb-256gb-ssd-win-10-office-2019-2gb-graphics.jpg",
    "inStock": true
  },
  {
    "id": "dell-inspiron-5502-15-6-inch39-6-cm-fhd-11th-gen-laptop-i5-1135g7-8gb-512-ssd-mx330-2gb-card-nvidia-graphics-card-win-10-ms-office-hs-silver-d560364win9s",
    "name": "Dell Inspiron 5502 11th gen Core i5 8GB/512 SSD D560364",
    "brand": "Dell",
    "category": "laptops",
    "price": 81199,
    "mrp": 98499,
    "image": "/products/dell-inspiron-5502-15-6-inch39-6-cm-fhd-11th-gen-laptop-i5-1135g7-8gb-512-ssd-mx330-2gb-card-nvidia-graphics-c.jpg",
    "inStock": true
  },
  {
    "id": "asus-vivobook-15-x515ep-ej512ts-i5-1135g7-mx330-8g-1t256g-pcie-ssd-transparent-silver-15-6fhd-1y-international-warranty-mcafee-office-hs-finger-print",
    "name": "ASUS Vivobook 15 i5 8GB/1T+256G X515EP-EJ512TS, Transpa",
    "brand": "ASUS",
    "category": "laptops",
    "price": 54599,
    "mrp": 78990,
    "image": "/products/asus-vivobook-15-x515ep-ej512ts-i5-1135g7-mx330-8g-1t256g-pcie-ssd-transparent-silver-15-6fhd-1y-international.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-feather-wired-optical-gaming-mouse",
    "name": "Zebronics Feather Wired Optical USB 2.0 Black Gaming Mo",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 450,
    "mrp": 799,
    "image": "/products/zebronics-feather-wired-optical-gaming-mouse.jpg",
    "inStock": true
  },
  {
    "id": "zebronics-zeb-transformer-m-optical-usb-gaming-mouse-with-led-effectblack",
    "name": "Zebronics Transformer-M Optical USB Gaming Mouse with L",
    "brand": "Zebronics",
    "category": "accessories",
    "price": 1179,
    "mrp": 1499,
    "image": "/products/zebronics-zeb-transformer-m-optical-usb-gaming-mouse-with-led-effectblack.jpg",
    "inStock": true
  },
  {
    "id": "hp-laserjet-138fnw-print-copy-scan-fax-wi-fi-printer-compact-design-reliable-and-fast-printing-network-support",
    "name": "HP Laserjet 138fnw Print Copy Scan & Fax, Wi-Fi Pr",
    "brand": "HP",
    "category": "printers",
    "price": 20199,
    "mrp": 23499,
    "image": "/products/hp-laserjet-138fnw-print-copy-scan-fax-wi-fi-printer-compact-design-reliable-and-fast-printing-network-support.jpg",
    "inStock": true
  },
  {
    "id": "hp-laserjet-pro-m132nw-monochrome-multi-functional-laser-printer",
    "name": "HP Laserjet Pro M132nw Monochrome Multi-Functional Lase",
    "brand": "HP",
    "category": "printers",
    "price": 13699,
    "mrp": 14398,
    "image": "/products/hp-laserjet-pro-m132nw-monochrome-multi-functional-laser-printer.jpg",
    "inStock": true
  },
  {
    "id": "canon-mf3010-digital-multifunction-laser-printer",
    "name": "Canon MF3010 Digital Multifunction Laser Printer",
    "brand": "Canon",
    "category": "printers",
    "price": 17899,
    "mrp": 20699,
    "image": "/products/canon-mf3010-digital-multifunction-laser-printer.jpg",
    "inStock": true
  },
  {
    "id": "epson-m2140-ecotank-duplex-ink-tank-printer",
    "name": "Epson M2140 Multi-function Monochrome Printer",
    "brand": "Epson",
    "category": "printers",
    "price": 17899,
    "mrp": 20599,
    "image": "/products/epson-m2140-ecotank-duplex-ink-tank-printer.jpg",
    "inStock": true
  },
  {
    "id": "canon-pixma-mg2577s-all-in-one-inkjet-colour-printer-blue-white",
    "name": "Canon PIXMA MG2577s All-in-One Inkjet Colour Printer (B",
    "brand": "Canon",
    "category": "printers",
    "price": 3499,
    "mrp": 4065,
    "image": "/products/canon-pixma-mg2577s-all-in-one-inkjet-colour-printer-blue-white.jpg",
    "inStock": true
  },
  {
    "id": "zebster-19-led-monitor-with-hdmi-zeb-v19hd-hdmivga-big-beat-fast-charge-data-cable-comboby-maxy",
    "name": "ZEBSTER 19\" LED Monitor with HDMI- ZEB-V19HD (HDM",
    "brand": "Zebronics",
    "category": "monitors",
    "price": 4149,
    "mrp": 7299,
    "image": "/products/zebster-19-led-monitor-with-hdmi-zeb-v19hd-hdmivga-big-beat-fast-charge-data-cable-comboby-maxy.jpg",
    "inStock": true
  },
  {
    "id": "canon-e560-multifunction-wireless-printer",
    "name": "Canon E560 All-in-One Inkjet Colour Printer",
    "brand": "Canon",
    "category": "printers",
    "price": 8679,
    "mrp": 9899,
    "image": "/products/canon-e560-multifunction-wireless-printer.jpg",
    "inStock": true
  }
];
