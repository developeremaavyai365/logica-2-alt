/** Express delivery: orders placed on the site from Delhi NCR are delivered
 *  in under one hour. The promise itself (region + time) comes from the
 *  business; the pincode rule below is how the shop page decides whether a
 *  visitor's pincode counts as "Delhi NCR". */
export const EXPRESS_DELIVERY = {
  region: 'Delhi NCR',
  maxMinutes: 60,
};

// TODO: confirm with operations exactly which pincodes get the under-1-hour
// promise. Until a real list exists this goes by postal prefix — the first
// three digits of an Indian pincode identify the sorting district:
//   110 Delhi · 121 Faridabad · 122 Gurugram · 201 Noida / Ghaziabad
// Those districts are wider than the cities themselves (201 also covers
// Greater Noida, 121 reaches Palwal), so this will say "yes" to some
// outlying pincodes that may not really be within an hour's reach.
const EXPRESS_PINCODE_PREFIXES = ['110', '121', '122', '201'];

export function isExpressPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode) && EXPRESS_PINCODE_PREFIXES.includes(pincode.slice(0, 3));
}
