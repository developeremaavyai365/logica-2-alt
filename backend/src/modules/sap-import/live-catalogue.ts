/* What the shop is told about each SAP code linked to one of its products.

   Only what a customer sees goes out: the name for the website, the
   selling price, the MRP and whether it can be bought. The stock count
   itself stays private. */

export interface LinkedItem {
  websiteProductId: string | null;
  websiteColour: string | null;
  modelName: string;
  stock: number;
  mrpInPaise: number;
  mopInPaise: number;
}

export interface LiveEntry {
  productId: string;
  /** The colour's key ("blue"), or null when the code is the whole product. */
  colour: string | null;
  /** "Model Name for Website" from the sheet. */
  name: string;
  /** Rupees. */
  price: number;
  /** Rupees. */
  mrp: number;
  inStock: boolean;
}

export function toLiveEntries(items: LinkedItem[]): LiveEntry[] {
  return items
    .filter((item): item is LinkedItem & { websiteProductId: string } => !!item.websiteProductId)
    .map((item) => ({
      productId: item.websiteProductId,
      colour: item.websiteColour,
      name: item.modelName,
      price: item.mopInPaise / 100,
      mrp: item.mrpInPaise / 100,
      inStock: item.stock > 0,
    }))
    .sort((a, b) => a.productId.localeCompare(b.productId) || (a.colour ?? '').localeCompare(b.colour ?? ''));
}
