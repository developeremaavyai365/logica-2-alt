import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** Client-side navigation keeps the previous page's scroll position, so
 *  opening a product or the Apply form landed mid-page. Reset to the top on
 *  every new path — but not on back/forward (POP), so returning to the shop
 *  keeps your place, and not on query-only changes like shop filters. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
