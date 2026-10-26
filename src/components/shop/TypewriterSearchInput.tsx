import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CornerDownLeft, Search, Tag, X } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { categories, formatINR } from '../../data';
import { productTitle, type ProductColour } from '../../product-colours';
import type { Product } from '../../products-data';
import {
  POPULAR_DESTINATIONS,
  searchSuggestions,
  type BrandSuggestion,
  type SearchDestination,
} from '../../shop-search';

// Every phrase below is a close match to a real product in products-data.ts
// (MacBook Air, HP laptop, Galaxy S25 Ultra, Brother printer, monitor,
// Logitech) — verified against the catalogue rather than invented.
const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

const PHRASES = ['MacBook Air', 'HP laptop', 'Galaxy S25 Ultra', 'Brother printer', 'monitor', 'Logitech mouse'];

const CATEGORY_ICON = new Map(categories.map((c) => [c.slug, c.icon]));

/** One row of the suggestions list. `href` is where choosing it goes; the
 *  plain-search row has none, because the grid is already filtered live. */
type Item =
  | { kind: 'destination'; key: string; href: string; destination: SearchDestination }
  | { kind: 'brand'; key: string; href: string; brand: BrandSuggestion }
  | { kind: 'product'; key: string; href: string; product: Product; colour?: ProductColour }
  | { kind: 'query'; key: string; href?: undefined };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The query's first occurrence in `text`, in bold. */
function highlight(text: string, query: string): ReactNode {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold text-shop-ink">{text.slice(at, at + q.length)}</strong>
      {text.slice(at + q.length)}
    </>
  );
}

export default function TypewriterSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [display, setDisplay] = useState('');
  const [fade, setFade] = useState(true);
  const phraseIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const listboxId = useId();

  // The list is open while the box has focus, until Escape or a choice.
  const [open, setOpen] = useState(false);
  // The row picked with the arrow keys or the mouse. Null means the
  // default: the page the query names, when it names one ("iphone").
  const [cursor, setCursor] = useState<number | null>(null);

  const suggestions = useMemo(() => searchSuggestions(value), [value]);
  const query = value.trim();

  const sections = useMemo(() => {
    const out: { title: string; items: Item[] }[] = [];
    if (!query) {
      out.push({
        title: 'Jump to',
        items: POPULAR_DESTINATIONS.map((d) => ({ kind: 'destination', key: d.href, href: d.href, destination: d })),
      });
      return out;
    }
    if (suggestions.destinations.length) {
      out.push({
        title: 'Categories',
        items: suggestions.destinations.map((d) => ({ kind: 'destination', key: d.href, href: d.href, destination: d })),
      });
    }
    if (suggestions.brands.length) {
      out.push({
        title: 'Brands',
        items: suggestions.brands.map((b) => ({ kind: 'brand', key: b.href, href: b.href, brand: b })),
      });
    }
    if (suggestions.products.length) {
      out.push({
        title: 'Products',
        items: suggestions.products.map(({ product: p, colour }) => ({
          kind: 'product',
          key: p.id,
          // Opens on the colour the search asked for ("blue iphone").
          href: `/product/${encodeURIComponent(p.id)}${colour ? `?colour=${colour.key}` : ''}`,
          product: p,
          colour,
        })),
      });
    }
    out.push({ title: '', items: [{ kind: 'query', key: 'query' }] });
    return out;
  }, [query, suggestions]);

  const items = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const exactIndex = suggestions.exact
    ? items.findIndex((i) => i.kind === 'destination' && i.destination === suggestions.exact)
    : -1;
  const active = cursor ?? exactIndex;
  const showList = open && focused && items.length > 0;

  useEffect(() => setCursor(null), [value]);

  function choose(item: Item | undefined) {
    setOpen(false);
    if (!item?.href) return;
    onChange('');
    inputRef.current?.blur();
    navigate(item.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showList) {
        setOpen(true);
        return;
      }
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setCursor((Math.max(active, step > 0 ? -1 : 0) + step + items.length) % items.length);
    } else if (e.key === 'Escape') {
      if (showList) setOpen(false);
      else inputRef.current?.blur();
    }
  }

  const showTypewriter = !focused && value.length === 0;

  // `/` or Ctrl/Cmd+K focuses search, unless another field already has focus.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Reduced motion: static phrase swap every 3s with a fade, no typing.
  useEffect(() => {
    if (!showTypewriter || !reducedMotion) return;
    setDisplay(PHRASES[phraseIndex.current]);
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        phraseIndex.current = (phraseIndex.current + 1) % PHRASES.length;
        setDisplay(PHRASES[phraseIndex.current]);
        setFade(true);
      }, 200);
    }, 3000);
    return () => clearInterval(id);
  }, [showTypewriter, reducedMotion]);

  useEffect(() => {
    if (!showTypewriter || reducedMotion) return;
    let timeout: ReturnType<typeof setTimeout>;
    let stopped = false;

    function onVisibility() {
      if (document.hidden) {
        clearTimeout(timeout);
      } else if (!stopped) {
        timeout = setTimeout(tick, 400);
      }
    }

    const tick = () => {
      const phrase = PHRASES[phraseIndex.current];
      if (!deleting.current) {
        charIndex.current += 1;
        setDisplay(phrase.slice(0, charIndex.current));
        if (charIndex.current === phrase.length) {
          deleting.current = true;
          timeout = setTimeout(tick, 1600);
          return;
        }
        timeout = setTimeout(tick, 55);
      } else {
        charIndex.current -= 1;
        setDisplay(phrase.slice(0, charIndex.current));
        if (charIndex.current === 0) {
          deleting.current = false;
          phraseIndex.current = (phraseIndex.current + 1) % PHRASES.length;
          timeout = setTimeout(tick, 400);
          return;
        }
        timeout = setTimeout(tick, 30);
      }
    };

    timeout = setTimeout(tick, 400);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopped = true;
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [showTypewriter, reducedMotion]);

  useEffect(() => {
    if (!showTypewriter) {
      charIndex.current = 0;
      deleting.current = false;
      setDisplay('');
    }
  }, [showTypewriter]);

  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        // Enter opens the highlighted row — which, when the query names a
        // part of the shop ("iphone"), is that page. Otherwise the grid
        // below is already showing the results, so the list just closes.
        choose(showList ? items[active] : undefined);
      }}
    >
      {/* Three modules divided by hairlines, the same card language as the
          rest of the shop page: an icon tile, the field under its own
          micro-label, and a right-hand cell that is the keyboard hint while
          the box is empty and the Clear action once something is typed. */}
      <div
        className={`flex h-16 items-stretch overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${
          focused ? 'border-shop-ink ring-2 ring-shop-accent/40' : 'border-shop-line'
        }`}
      >
        {/* Module — icon tile */}
        <div
          className={`flex w-14 shrink-0 items-center justify-center border-r transition-colors duration-300 sm:w-16 ${
            focused ? 'border-shop-accent bg-shop-accent text-white' : 'border-shop-line bg-shop-canvas text-shop-ink/50'
          }`}
        >
          <Search className="h-5 w-5" />
        </div>

        {/* Module — field */}
        <label className="flex min-w-0 flex-1 cursor-text flex-col justify-center px-4">
          <span className={MICRO_LABEL}>Search the store</span>
          <span className="relative mt-0.5 block">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                setFocused(true);
                setOpen(true);
              }}
              onBlur={() => setFocused(false)}
              onKeyDown={onInputKeyDown}
              placeholder={showTypewriter ? '' : 'Products, brands and categories'}
              aria-label="Search products, brands and categories"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls={listboxId}
              aria-activedescendant={showList && active >= 0 ? `${listboxId}-${active}` : undefined}
              autoComplete="off"
              enterKeyHint="search"
              className="w-full bg-transparent text-base leading-6 text-shop-ink outline-none placeholder:text-shop-ink/35"
            />
            {showTypewriter && (
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-0 flex items-center overflow-hidden whitespace-nowrap text-base text-shop-ink/40 transition-opacity duration-200 ${
                  fade ? 'opacity-100' : 'opacity-0'
                }`}
              >
                Try {display}
                {!reducedMotion && <span className="ml-0.5 inline-block h-[1em] w-[1px] animate-pulse bg-shop-ink/40" />}
              </span>
            )}
          </span>
        </label>

        {/* Module — shortcut hint / clear */}
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex shrink-0 items-center gap-1.5 border-l border-shop-line px-4 text-xs font-semibold text-shop-ink/60 transition-colors duration-300 hover:bg-shop-ink hover:text-white"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 border-l border-shop-line px-4 sm:flex">
            <span className={MICRO_LABEL}>Press</span>
            <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-shop-line bg-shop-canvas px-1.5 font-mono text-xs text-shop-ink/60">
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Suggestions — the same module language as the bar: a header strip
          per group, hairlines between rows, a footer of key hints. Mouse
          down is cancelled so the box keeps focus while a row is clicked. */}
      {showList && (
        <div
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-shop-line bg-white shadow-[0_28px_60px_-24px_rgba(14,14,14,0.4)]"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul id={listboxId} role="listbox" aria-label="Search suggestions" className="max-h-[min(70vh,560px)] overflow-y-auto">
            {sections.map((section) => {
              const grid = section.title === 'Jump to';
              return (
                <li key={section.title || 'query'} role="presentation" className="border-t border-shop-line first:border-t-0">
                  {section.title && (
                    <div className={`border-b border-shop-line bg-shop-canvas/70 px-4 py-2 ${MICRO_LABEL}`}>{section.title}</div>
                  )}
                  <ul role="presentation" className={grid ? 'grid grid-cols-1 sm:grid-cols-2' : undefined}>
                    {section.items.map((item) => {
                      const index = items.indexOf(item);
                      const on = index === active;
                      return (
                        <li
                          key={item.key}
                          id={`${listboxId}-${index}`}
                          role="option"
                          aria-selected={on}
                          onMouseMove={() => cursor !== index && setCursor(index)}
                          onClick={() => choose(item)}
                          className={`relative flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-150 ${
                            on ? 'bg-shop-accent/[0.07]' : 'bg-white'
                          } ${grid ? 'border-b border-shop-line last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0' : 'border-b border-shop-line last:border-b-0'}`}
                        >
                          {on && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-shop-accent" />}
                          <SuggestionRow
                            item={item}
                            query={query}
                            exact={item.kind === 'destination' && item.destination === suggestions.exact}
                          />
                          {on && item.kind !== 'query' && (
                            <span className="hidden shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-shop-accent sm:flex">
                              <CornerDownLeft className="h-3 w-3" />
                              Open
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
          <div className={`hidden items-center gap-4 border-t border-shop-line bg-shop-canvas/70 px-4 py-2 sm:flex ${MICRO_LABEL}`}>
            <span>↑ ↓ to move</span>
            <span>↵ to open</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </form>
  );
}

function SuggestionRow({ item, query, exact }: { item: Item; query: string; exact: boolean }) {
  if (item.kind === 'query') {
    return (
      <>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-shop-line bg-shop-canvas text-shop-ink/50">
          <Search className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-shop-ink/70">
          Show all results for <strong className="font-semibold text-shop-ink">“{query}”</strong>
        </span>
      </>
    );
  }

  if (item.kind === 'product') {
    const p = item.product;
    const c = item.colour;
    return (
      <>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-shop-line bg-white p-1">
          <img src={c?.images[0] ?? p.image} alt="" loading="lazy" className="h-full w-full object-contain" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-shop-ink/75">{highlight(productTitle(p, c), query)}</span>
          <span className={`mt-0.5 flex items-center gap-1.5 ${MICRO_LABEL}`}>
            {p.brand}
            {c && (
              <>
                <span aria-hidden="true">·</span>
                <span className="h-2 w-2 rounded-full border border-shop-ink/15" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                {c.name}
              </>
            )}
            {!(c?.inStock ?? p.inStock) && ' · Out of stock'}
          </span>
        </span>
        <span className="shrink-0 font-dm-sans text-sm font-semibold tabular-nums text-shop-ink">{formatINR(p.price)}</span>
      </>
    );
  }

  if (item.kind === 'brand') {
    const b = item.brand;
    return (
      <>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-shop-line bg-shop-canvas text-shop-ink/60">
          <Tag className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-shop-ink/75">{highlight(b.brand, query)}</span>
          <span className={`mt-0.5 block ${MICRO_LABEL}`}>Brand · {plural(b.count, 'product')}</span>
        </span>
      </>
    );
  }

  const d = item.destination;
  const Icon = CATEGORY_ICON.get(d.categorySlug) ?? Search;
  return (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
          exact ? 'border-shop-accent bg-shop-accent text-white' : 'border-shop-line bg-shop-canvas text-shop-ink/60'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm text-shop-ink/75">{highlight(d.label, query)}</span>
          {exact && (
            <span className="shrink-0 rounded-full bg-shop-accent px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-white">
              Go to page
            </span>
          )}
        </span>
        <span className={`mt-0.5 block ${MICRO_LABEL}`}>
          {d.parentLabel ? `${d.parentLabel} · ` : 'Category · '}
          {plural(d.count, 'product')}
        </span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-shop-ink/30" />
    </>
  );
}
