/** The colour grounds shared by the shop page's colour cards (the deal strip
 *  and the Top 5 strip), so both draw from one palette. Each is dark enough
 *  for white text to read on it. */
export interface CardTone {
  /** Card background. */
  ground: string;
  /** The tone's deep solid — for a pill on a white panel, or coloured text
   *  on a white badge. */
  pill: string;
}

export const CARD_TONES = {
  blue: { ground: 'linear-gradient(165deg, #4D5FF2 0%, #2230A6 100%)', pill: '#2230A6' },
  navy: { ground: 'linear-gradient(165deg, #123A8F 0%, #061A40 100%)', pill: '#061A40' },
  orange: { ground: 'linear-gradient(165deg, #F0700F 0%, #B8400A 100%)', pill: '#B8400A' },
  crimson: { ground: 'linear-gradient(165deg, #D62246 0%, #9B1239 100%)', pill: '#9B1239' },
  green: { ground: 'linear-gradient(165deg, #17914A 0%, #0D5C2E 100%)', pill: '#0D5C2E' },
} satisfies Record<string, CardTone>;
