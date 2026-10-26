import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const INVESTOR_PAGES = ['/advertisement', '/basis-of-allotment', '/authorized-person', '/grievance-redressal'];

/** Pages that are tabs of one page — About's three, and every Investor
 *  Relations page — which switch in place under a shared hero. Which group a
 *  path belongs to, or null. */
const tabGroup = (path: string) => {
  if (path === '/about' || path.startsWith('/about/')) return 'about';
  if (path === '/investor' || path.startsWith('/investor/') || INVESTOR_PAGES.includes(path)) return 'investor';
  return null;
};

/** Client-side navigation keeps the previous page's scroll position, so
 *  opening a product or the Apply form landed mid-page. Reset to the top on
 *  every new page — but not on back/forward (POP), so returning to the shop
 *  keeps your place, and not on query-only changes like shop filters.
 *
 *  The one query value that does count as a new page is `?sub=`: a shop
 *  sub-category (MacBook under Laptops) is its own listing, reached by a
 *  link, even though the path stays the same. */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  const sub = new URLSearchParams(search).get('sub') ?? '';

  // The About and Investor Relations tabs have their own URLs but are one
  // page each — switching between them keeps your place.
  const previousPath = useRef(pathname);

  useLayoutEffect(() => {
    const from = previousPath.current;
    previousPath.current = pathname;
    if (navigationType === 'POP') return;
    const group = tabGroup(pathname);
    if (from !== pathname && group !== null && tabGroup(from) === group) return;
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, sub]);

  return null;
}
