import { products } from '../data';
import { findColour, productTitle } from '../product-colours';

/** How a product (in a colour) looks in checkout and on an order: its
 *  photo, page link and colour. The name comes from the server (the SAP
 *  sheet's), with the catalogue's title as the fallback. */
export function lineVisual(productId: string, colourKey: string | null | undefined) {
  const product = products.find((p) => p.id === productId);
  const colour = findColour(productId, colourKey);
  return {
    product,
    colour,
    image: colour?.images[0] ?? product?.image ?? '',
    title: product ? productTitle(product, colour) : productId,
    href: colour ? `/product/${productId}?colour=${colour.key}` : `/product/${productId}`,
  };
}
