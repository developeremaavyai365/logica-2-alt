import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartLine {
  id: string;
  qty: number;
}

interface StoreState {
  cart: CartLine[];
  wishlist: string[];
}

interface StoreApi extends StoreState {
  ready: boolean;
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  inCart: (id: string) => boolean;
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
    const addToCart = (id: string, qty = 1) =>
      setState((s) => {
        const found = s.cart.find((l) => l.id === id);
        const cart = found
          ? s.cart.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
          : [...s.cart, { id, qty }];
        return { ...s, cart };
      });

    const setQty = (id: string, qty: number) =>
      setState((s) => ({
        ...s,
        cart: qty <= 0 ? s.cart.filter((l) => l.id !== id) : s.cart.map((l) => (l.id === id ? { ...l, qty } : l)),
      }));

    const removeFromCart = (id: string) => setState((s) => ({ ...s, cart: s.cart.filter((l) => l.id !== id) }));
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
      inCart: (id) => state.cart.some((l) => l.id === id),
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
