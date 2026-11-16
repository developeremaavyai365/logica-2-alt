import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuthStore } from './auth-store';
import { apiFetch } from './lib/api-client';

export interface CartLine {
  id: string;
  qty: number;
  /** The colour chosen on the product page (a key from product-colours),
   *  for products that come in more than one. */
  colour?: string;
}

/** What tells two cart lines apart: the product and, if chosen, its colour —
 *  a blue and a black of the same phone are two lines. */
export const lineKey = (line: { id: string; colour?: string }) => (line.colour ? `${line.id}#${line.colour}` : line.id);

interface StoreState {
  cart: CartLine[];
  wishlist: string[];
  /** Whose wishlist this is: the signed-in account it mirrors, or null for
   *  a guest's. Only a guest's list is merged into an account on sign-in;
   *  an account's own copy is replaced by the account's, so something
   *  removed on another device does not come back from this one. */
  wishlistOwner: string | null;
}

/** The catalogue's product ids, as the backend accepts them. */
const PRODUCT_ID = /^[a-z0-9][a-z0-9-]{0,199}$/;
type WishlistResponse = { productIds: string[] };

interface StoreApi extends StoreState {
  ready: boolean;
  addToCart: (id: string, qty?: number, colour?: string) => void;
  /** Takes a line's `lineKey`. */
  setQty: (key: string, qty: number) => void;
  /** Takes a line's `lineKey`. */
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  cartCount: number;
  inCart: (id: string, colour?: string) => boolean;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
}

const KEY = 'logica2-shop-v1';

const StoreContext = createContext<StoreApi | null>(null);

export function ShopStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({ cart: [], wishlist: [], wishlistOwner: null });
  const [ready, setReady] = useState(false);
  const { user, ready: authReady } = useAuthStore();
  const userId = user?.id ?? null;
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          cart: Array.isArray(parsed.cart) ? parsed.cart : [],
          wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
          wishlistOwner: typeof parsed.wishlistOwner === 'string' ? parsed.wishlistOwner : null,
        });
      }
    } catch {
      // ignore malformed localStorage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore write failures (private browsing, quota, etc.)
    }
  }, [state, ready]);

  // The wishlist follows the account. On signing in, a guest's list is
  // added to the account's; an account's copy is just refreshed. On
  // signing out it is cleared, so the next person on this device does not
  // see it.
  useEffect(() => {
    if (!ready || !authReady) return;
    const { wishlist, wishlistOwner } = stateRef.current;
    if (!userId) {
      if (wishlistOwner) setState((s) => ({ ...s, wishlist: [], wishlistOwner: null }));
      return;
    }
    let cancelled = false;
    const request =
      wishlistOwner === null && wishlist.length > 0
        ? apiFetch<WishlistResponse>('/wishlist/merge', {
            method: 'POST',
            body: { productIds: wishlist.filter((id) => PRODUCT_ID.test(id)).slice(0, 200) },
          })
        : apiFetch<WishlistResponse>('/wishlist');
    request
      .then((r) => {
        if (!cancelled) setState((s) => ({ ...s, wishlist: r.productIds, wishlistOwner: userId }));
      })
      .catch(() => {
        // Offline or the backend is down: keep what this device has and
        // try again next time.
      });
    return () => {
      cancelled = true;
    };
  }, [ready, authReady, userId]);

  const api = useMemo<StoreApi>(() => {
    /** Saves a wishlist change to the account. If it fails, the account's
     *  list is fetched again so the page shows what is really saved. */
    const syncWishlist = (id: string, add: boolean) => {
      if (!userId || !PRODUCT_ID.test(id)) return;
      apiFetch(`/wishlist/${id}`, { method: add ? 'PUT' : 'DELETE' }).catch(() =>
        apiFetch<WishlistResponse>('/wishlist')
          .then((r) => setState((s) => ({ ...s, wishlist: r.productIds })))
          .catch(() => {}),
      );
    };

    const addToCart = (id: string, qty = 1, colour?: string) =>
      setState((s) => {
        const key = lineKey({ id, colour });
        const found = s.cart.find((l) => lineKey(l) === key);
        const cart = found
          ? s.cart.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + qty } : l))
          : [...s.cart, colour ? { id, qty, colour } : { id, qty }];
        return { ...s, cart };
      });

    const setQty = (key: string, qty: number) =>
      setState((s) => ({
        ...s,
        cart:
          qty <= 0 ? s.cart.filter((l) => lineKey(l) !== key) : s.cart.map((l) => (lineKey(l) === key ? { ...l, qty } : l)),
      }));

    const removeFromCart = (key: string) => setState((s) => ({ ...s, cart: s.cart.filter((l) => lineKey(l) !== key) }));
    const clearCart = () => setState((s) => ({ ...s, cart: [] }));

    const toggleWishlist = (id: string) => {
      const add = !state.wishlist.includes(id);
      setState((s) => ({
        ...s,
        wishlist: add ? (s.wishlist.includes(id) ? s.wishlist : [...s.wishlist, id]) : s.wishlist.filter((w) => w !== id),
      }));
      syncWishlist(id, add);
    };
    const removeFromWishlist = (id: string) => {
      setState((s) => ({ ...s, wishlist: s.wishlist.filter((w) => w !== id) }));
      syncWishlist(id, false);
    };

    return {
      ...state,
      ready,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      cartCount: state.cart.reduce((n, l) => n + l.qty, 0),
      inCart: (id, colour) => state.cart.some((l) => lineKey(l) === lineKey({ id, colour })),
      toggleWishlist,
      inWishlist: (id) => state.wishlist.includes(id),
      removeFromWishlist,
    };
  }, [state, ready, userId]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useShopStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useShopStore must be used within ShopStoreProvider');
  return ctx;
}
