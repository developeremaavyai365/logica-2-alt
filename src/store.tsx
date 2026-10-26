import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
}

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
  const [state, setState] = useState<StoreState>({ cart: [], wishlist: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          cart: Array.isArray(parsed.cart) ? parsed.cart : [],
          wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
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

  const api = useMemo<StoreApi>(() => {
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

    const toggleWishlist = (id: string) =>
      setState((s) => ({
        ...s,
        wishlist: s.wishlist.includes(id) ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id],
      }));
    const removeFromWishlist = (id: string) =>
      setState((s) => ({ ...s, wishlist: s.wishlist.filter((w) => w !== id) }));

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
  }, [state, ready]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useShopStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useShopStore must be used within ShopStoreProvider');
  return ctx;
}
