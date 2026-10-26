export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'discount';

export const SORT_KEYS: SortKey[] = ['featured', 'price-asc', 'price-desc', 'discount'];

export interface ShopFilterState {
  q: string;
  cat: string;
  brands: string[];
  min: number | undefined;
  max: number | undefined;
  disc: number | undefined;
  sort: SortKey;
  page: number;
}

const isSortKey = (v: string | null): v is SortKey => !!v && (SORT_KEYS as string[]).includes(v);

/** Reads shop filter state from URLSearchParams, tolerating malformed or
 *  missing values rather than throwing. */
export function parseShopParams(params: URLSearchParams): ShopFilterState {
  const q = params.get('q')?.trim() ?? '';
  const cat = params.get('cat')?.trim() ?? '';
  const brandRaw = params.get('brand');
  const brands = brandRaw ? brandRaw.split(',').map((b) => b.trim()).filter(Boolean) : [];
  const minRaw = params.get('min');
  const maxRaw = params.get('max');
  const discRaw = params.get('disc');
  const sortRaw = params.get('sort');
  const pageRaw = params.get('page');

  const min = minRaw !== null && !Number.isNaN(Number(minRaw)) ? Math.max(0, Number(minRaw)) : undefined;
  const max = maxRaw !== null && !Number.isNaN(Number(maxRaw)) ? Math.max(0, Number(maxRaw)) : undefined;
  const disc = discRaw !== null && !Number.isNaN(Number(discRaw)) ? Math.max(0, Math.min(90, Number(discRaw))) : undefined;
  const page = pageRaw !== null && !Number.isNaN(Number(pageRaw)) && Number(pageRaw) > 0 ? Math.floor(Number(pageRaw)) : 1;

  return {
    q,
    cat,
    brands,
    min,
    max,
    disc,
    sort: isSortKey(sortRaw) ? sortRaw : 'featured',
    page,
  };
}

/** Serializes shop filter state back to a query string, omitting
 *  default/empty values so URLs stay clean. */
export function serializeShopParams(state: ShopFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.cat) params.set('cat', state.cat);
  if (state.brands.length) params.set('brand', state.brands.join(','));
  if (state.min !== undefined) params.set('min', String(state.min));
  if (state.max !== undefined) params.set('max', String(state.max));
  if (state.disc !== undefined) params.set('disc', String(state.disc));
  if (state.sort !== 'featured') params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  return params;
}
