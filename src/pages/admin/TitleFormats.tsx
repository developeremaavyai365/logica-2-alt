import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Plus, RotateCcw } from 'lucide-react';
import AdminShell from './AdminShell';
import { ApiError, apiFetch } from '../../lib/api-client';
import { buildTitle, pickTitleFormat, type TitleInput } from '../../lib/listing-shared';

/* Product title formats: one per brand and category, with an example of the
   title each gives. Saving a format re-titles every product whose title is
   automatic and built from it. */

interface FormatRow {
  category: string | null;
  brand: string | null;
  pattern: string;
  builtIn: string | null;
  custom: boolean;
}

interface Data {
  fields: { key: string; label: string }[];
  categories: { slug: string; name: string }[];
  brands: string[];
  formats: FormatRow[];
  retitled?: number;
}

const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';
const INPUT =
  'h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#061A40] outline-none transition-colors placeholder:text-[#9CA3AF] hover:border-[#C7D2FE] focus:border-[#3D4FE0]';

const spec = (pairs: [string, string][]) => pairs.map(([label, value]) => ({ label, value }));

/** Example models, so each format's example reads like a real product. */
const PHONE_MODELS: Record<string, string> = {
  Apple: 'iPhone 16',
  Samsung: 'Galaxy S24 5G',
  OnePlus: 'Nord CE4',
  realme: '12 Pro+ 5G',
  vivo: 'T2x 5G',
  OPPO: 'Reno11 Pro 5G',
  Redmi: 'Note 13 5G',
  Xiaomi: '14 Civi',
  HONOR: 'X9b 5G',
  Motorola: 'Edge 50 Fusion',
};
const LAPTOP_MODELS: Record<string, [string, string]> = {
  Apple: ['MacBook Air M2', 'MLY33HN/A'],
  HP: ['15s', '15s-fq5111TU'],
  Dell: ['Inspiron 3520', 'IN3520P9K46001ORB1'],
  ASUS: ['Vivobook 15', 'X1502ZA-EJ532WS'],
  Acer: ['Aspire 7', 'A715-76G'],
  Lenovo: ['IdeaPad Slim 3', '82RK00VWIN'],
};

/** A made-up product to show what each format gives. */
function sample(category: string | null, brand: string | null): { input: TitleInput; colour: string } {
  if (category === 'mobile-phones') {
    const b = brand ?? 'Motorola';
    return {
      input: { brand: b, modelName: PHONE_MODELS[b] ?? 'Phone 2', modelNumber: 'SM-S921B', variant: null, specs: spec([['RAM', '8 GB'], ['Internal Storage', '256 GB']]) },
      colour: 'Onyx Black',
    };
  }
  if (category === 'laptops') {
    const b = brand ?? 'Lenovo';
    const [model, number] = LAPTOP_MODELS[b] ?? ['Notebook 15', 'NB15-001'];
    return {
      input: {
        brand: b,
        modelName: model,
        modelNumber: number,
        variant: null,
        specs: spec([
          ['Processor', 'Intel Core i5 12th Gen'],
          ['RAM', '16 GB'],
          ['Storage', '512 GB SSD'],
          ['Screen Size', '15.6 inch'],
          ['Operating System', 'Windows 11'],
        ]),
      },
      colour: 'Arctic Grey',
    };
  }
  if (category === 'printers') {
    const b = brand ?? 'HP';
    return {
      input: {
        brand: b,
        modelName: 'Smart Tank 525',
        modelNumber: null,
        variant: null,
        specs: spec([
          ['Printer Type', 'Ink Tank'],
          ['Functions', 'Print, Scan, Copy'],
          ['Printing Output', 'Colour'],
          ['Connectivity', 'USB, Wi-Fi'],
        ]),
      },
      colour: '',
    };
  }
  return { input: { brand: brand ?? 'Microtek', modelName: 'Legend UPS', modelNumber: null, variant: '650 VA', specs: [] }, colour: 'Black' };
}

function FormatEditor({ row, categoryName, fields, onSave, onReset, busy }: {
  row: FormatRow;
  categoryName: string;
  fields: { key: string; label: string }[];
  onSave: (pattern: string) => void;
  onReset: () => void;
  busy: boolean;
}) {
  const [pattern, setPattern] = useState(row.pattern);
  const [editing, setEditing] = useState(false);
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => setPattern(row.pattern), [row.pattern]);
  const { input, colour } = sample(row.category, row.brand);
  const example = buildTitle(pattern, input, colour || null);
  const changed = pattern.trim() !== row.pattern;

  /** Puts a field where the cursor is (or at the end), with a space. */
  const insert = (key: string) => {
    const el = box.current;
    const at = el?.selectionStart ?? pattern.length;
    const before = pattern.slice(0, at);
    const piece = `${before && !/\s$/.test(before) ? ' ' : ''}{${key}}`;
    const next = before + piece + pattern.slice(el?.selectionEnd ?? at);
    setPattern(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + piece.length, at + piece.length);
    });
  };

  return (
    <li className="grid gap-2 px-5 py-4 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-start">
      <div className="pt-2">
        <p className="text-sm font-semibold text-[#061A40]">{row.brand ?? `Any other brand`}</p>
        <p className="text-xs text-[#6B7280]">
          {row.custom ? (row.builtIn ? 'Changed by you' : 'Added by you') : 'Built in'}
          {!row.brand && ` · ${categoryName}`}
        </p>
      </div>
      <div className="min-w-0">
        {/* What the title looks like comes first; the pattern itself only
            when changing it. */}
        <p className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFE] px-3.5 py-2.5 text-sm font-semibold leading-snug text-[#061A40]">{example || '—'}</p>
        {editing ? (
          <div className="mt-2">
            <input
              ref={box}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              maxLength={300}
              aria-label={`Title format for ${row.brand ?? 'other brands'}`}
              className={`${INPUT} font-mono text-[13px]`}
            />
            <p className="mt-2 text-xs text-[#6B7280]">Press a button to add it where the cursor is. Brackets and commas are kept as typed.</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {fields.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => insert(f.key)}
                  className="rounded-lg border border-[#C7D2FE] bg-[#EEF1FF] px-2 py-1 text-xs font-semibold text-[#3D4FE0] transition-colors hover:bg-[#3D4FE0] hover:text-white"
                >
                  + {f.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="mt-1.5 text-xs font-semibold text-[#3D4FE0] hover:underline">
            Change how this title is written
          </button>
        )}
      </div>
      <div className="flex gap-2 lg:pt-0.5">
        <button
          type="button"
          disabled={!changed || busy}
          onClick={() => onSave(pattern)}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-[#061A40] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-30"
        >
          <Check className="h-4 w-4" /> Save
        </button>
        {row.custom && (
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            title={row.builtIn ? 'Back to the built-in format' : 'Remove this format'}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 text-sm font-semibold text-[#6B7280] transition-colors hover:border-[#3D4FE0] hover:text-[#3D4FE0] disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> {row.builtIn ? 'Reset' : 'Remove'}
          </button>
        )}
      </div>
    </li>
  );
}

function TitleFormatsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');

  useEffect(() => {
    apiFetch<Data>('/admin/title-formats')
      .then(setData)
      .catch(() => setError('Could not load the title formats.'));
  }, []);

  async function send(path: string, method: 'PUT' | 'POST', body: Record<string, unknown>, done: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await apiFetch<Data>(path, { method, body });
      setData(result);
      setNotice(`${done} ${result.retitled ? `${result.retitled} product title${result.retitled === 1 ? ' was' : 's were'} rebuilt to match.` : 'No product title needed changing.'}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const groups = useMemo(() => {
    if (!data) return [];
    const order = [...data.categories.map((c) => c.slug), null];
    return order
      .map((slug) => ({
        slug,
        name: slug ? (data.categories.find((c) => c.slug === slug)?.name ?? slug) : 'All other categories',
        rows: data.formats.filter((f) => f.category === slug).sort((a, b) => (a.brand === null ? 1 : b.brand === null ? -1 : a.brand.localeCompare(b.brand))),
      }))
      .filter((g) => g.rows.length);
  }, [data]);

  const addFormat = () => {
    if (!data || !newBrand.trim()) return;
    const category = newCategory || null;
    const base = pickTitleFormat(newBrand.trim(), category ?? '', data.formats.map((f) => ({ brand: f.brand, category: f.category, pattern: f.pattern })));
    void send('/admin/title-formats', 'PUT', { brand: newBrand.trim(), category, pattern: base.pattern }, `Added a format for ${newBrand.trim()}.`);
    setNewBrand('');
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-24 sm:px-6">
      <div>
        <Link to="/admin/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#061A40]">
          <ArrowLeft className="h-4 w-4" /> More tools
        </Link>
        <h1 className="mt-2 font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
          How product titles are written
        </h1>
        <p className="mt-1 max-w-3xl text-[#6B7280]">
          Each brand's products get titles in its own style. Titles are written for you from the product's details; change a style here and
          every title written that way is updated on the website.
        </p>
      </div>

      {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {!data && !error && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#9CA3AF]" />
        </div>
      )}

      {groups.map((g) => (
        <section key={g.slug ?? '*'} className={`${CARD} overflow-hidden`}>
          <h2 className="border-b border-[#EEF0F6] px-5 py-3.5 font-dm-sans text-base font-bold text-[#061A40]">{g.name}</h2>
          <ul className="divide-y divide-[#EEF0F6]">
            {g.rows.map((row) => (
              <FormatEditor
                key={`${row.category}|${row.brand}`}
                row={row}
                categoryName={g.name}
                fields={data!.fields}
                busy={busy}
                onSave={(pattern) => void send('/admin/title-formats', 'PUT', { brand: row.brand, category: row.category, pattern }, 'Format saved.')}
                onReset={() => void send('/admin/title-formats/reset', 'POST', { brand: row.brand, category: row.category }, row.builtIn ? 'Back to the built-in format.' : 'Format removed.')}
              />
            ))}
          </ul>
        </section>
      ))}

      {data && (
        <section className={`${CARD} p-5`}>
          <p className="text-sm font-semibold text-[#061A40]">Add a format for a brand</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">It starts as a copy of the format the brand uses now; change it, then save.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} aria-label="Category" className={INPUT}>
              <option value="">All categories</option>
              {data.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <input list="format-brands" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} maxLength={60} placeholder="Brand, e.g. Motorola" aria-label="Brand" className={INPUT} />
            <datalist id="format-brands">
              {data.brands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
            <button
              type="button"
              disabled={busy || !newBrand.trim()}
              onClick={addFormat}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#061A40] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3D4FE0] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default function TitleFormats() {
  return (
    <AdminShell>
      <TitleFormatsPage />
    </AdminShell>
  );
}
