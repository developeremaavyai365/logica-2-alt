export interface NewArrivalEntry {
  id: string;
  name: string;
  tagline: string;
  description: string;
  video: string;
  preorderOpen: boolean;
  eta: string;
  href: string;
}

/** Newest-first — the homepage spotlight always shows entry [0], so
 *  adding the next new product is just unshifting a new entry here. */
export const NEW_ARRIVALS: NewArrivalEntry[] = [
  {
    id: 'new-phone-2026',
    name: 'Now Launching at Logica Infoway',
    tagline: 'Just landed',
    description:
      'The newest phone in our lineup has arrived. Reserve yours now and be first in line when it ships.',
    video: '/videos/new-product-pc.mp4',
    preorderOpen: true,
    eta: 'Ships soon',
    href: '/contact',
  },
];
