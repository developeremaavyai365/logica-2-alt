import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import AdminShell from './AdminShell';
import { ApiError, apiFetch } from '../../lib/api-client';
import { type ChangeValue as Value, fieldLabel, rupees, shownValue as shown } from './change-format';

/* Adding and editing products in bulk, the way a marketplace seller account
   does it: download a sheet (blank, or with the products already listed),
   fill it in, upload it, see exactly what it would change, then apply. */

type Status = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

interface Issue {
  rowNumber: number;
  product: string | null;
  severity: 'error' | 'warning';
  message: string;
}

interface Summary {
  fileName: string;
  headerRowNumber: number;
  columnsRead: string[];
  ignoredHeadings: string[];
  totals: { rows: number; toCreate: number; toUpdate: number; unchanged: number; rejected: number; warnings: number };
  needsConfirmation: string | null;
  newBrands: string[];
  issues: Issue[];
  created: { rowNumber: number; name: string; category: string; status: Status; priceInPaise: number }[];
  updated: { rowNumber: number; slug: string; name: string; changes: { field: string; from: Value; to: Value }[] }[];
  priceAlerts: { rowNumber: number; slug: string; name: string; fromPaise: number; toPaise: number; percent: number }[];
}

interface Applied extends Summary {
  appliedAt: string;
}

const CARD = 'rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';
const SELECT =
  'h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#061A40] outline-none transition-colors hover:border-[#C7D2FE] focus:border-[#3D4FE0]';
const PRIMARY =
  'flex items-center justify-center gap-2 rounded-xl bg-[#061A40] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(6,26,64,0.6)] transition-colors duration-300 hover:bg-[#3D4FE0] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#061A40]';
const TH = 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]';
const TD = 'px-4 py-3 align-top text-sm text-[#061A40]';

const STATUS_LABEL: Record<Status, string> = { ACTIVE: 'Active', DRAFT: 'Draft', INACTIVE: 'Inactive' };
const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

function Section({ step, title, aside, children }: { step: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="flex items-center gap-3 font-dm-sans text-base font-bold text-[#061A40]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF0FD] text-xs font-bold text-[#3D4FE0]">{step}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'good' | 'plain' | 'bad' }) {
  const colour = value === 0 ? 'text-[#C2C7D0]' : tone === 'good' ? 'text-[#3D4FE0]' : tone === 'bad' ? 'text-red-600' : 'text-[#061A40]';
  return (
    <div className="bg-white px-5 py-4">
      <span className="block text-xs font-medium text-[#6B7280]">{label}</span>
      <span className={`mt-1 block font-dm-sans text-3xl font-bold tabular-nums leading-none ${colour}`}>{value.toLocaleString('en-IN')}</span>
    </div>
  );
}

function Notice({ tone, children }: { tone: 'error' | 'warn' | 'good'; children: ReactNode }) {
  const style =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800';
  const Icon = tone === 'good' ? Check : AlertTriangle;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${style}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function DownloadSheet() {
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [category, setCategory] = useState('all');
  const [withProducts, setWithProducts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ categories: { slug: string; name: string }[] }>('/admin/products/options')
      .then((o) => setCategories(o.categories))
      .catch(() => setCategories([]));
  }, []);

  async function download() {
    setBusy(true);
    setError('');
    try {
      const blob = await apiFetch<Blob>(`/admin/products/bulk/template?category=${encodeURIComponent(category)}&products=${withProducts}`, { as: 'blob' });
      const name = categories.find((c) => c.slug === category)?.name ?? 'All categories';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Logica products - ${name}${withProducts ? '' : ' (blank)'}.xlsx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The sheet could not be downloaded. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section step="1" title="Download the sheet">
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <label className="block">
          <span className="text-sm font-semibold text-[#061A40]">Category</span>
          <span className="mt-0.5 block text-xs text-[#6B7280]">A single category adds a column for each of its specs.</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${SELECT} mt-2 w-full`}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-semibold text-[#061A40]">What goes in it</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                [false, 'Blank', 'To add new products.'],
                [true, 'With the products already listed', 'To edit them, or add more below.'],
              ] as const
            ).map(([value, title, detail]) => {
              const on = withProducts === value;
              return (
                <button
                  key={title}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setWithProducts(value)}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    on ? 'border-[#3D4FE0] bg-[#EEF0FD]' : 'border-[#E5E7EB] bg-white hover:border-[#C7D2FE]'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#061A40]">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${on ? 'border-[#3D4FE0] bg-[#3D4FE0] text-white' : 'border-[#C2C7D0]'}`}>
                      {on && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                    </span>
                    {title}
                  </span>
                  <span className="mt-1 block pl-6 text-xs text-[#6B7280]">{detail}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E5E7EB] px-5 py-3.5">
        <button type="button" onClick={download} disabled={busy} className={`${PRIMARY} h-11`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download sheet
        </button>
        <p className="text-xs text-[#6B7280]">Each heading has a note on what to put in it, and the sheet has a "How to fill" tab.</p>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </div>
    </Section>
  );
}

function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<'checking' | 'applying' | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Summary | null>(null);
  const [applied, setApplied] = useState<Applied | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function choose(next: File | null) {
    setFile(next);
    setPreview(null);
    setConfirmed(false);
    setError('');
    if (next) setApplied(null);
  }

  function form(extra: Record<string, string> = {}) {
    const data = new FormData();
    data.append('file', file as File);
    for (const [key, value] of Object.entries(extra)) data.append(key, value);
    return data;
  }

  async function check() {
    if (!file) return;
    setBusy('checking');
    setError('');
    setPreview(null);
    setApplied(null);
    try {
      setPreview(await apiFetch<Summary>('/admin/products/bulk/preview', { method: 'POST', body: form() }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The sheet could not be checked. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function apply() {
    if (!file || !preview) return;
    setBusy('applying');
    setError('');
    try {
      const result = await apiFetch<Applied>('/admin/products/bulk/apply', { method: 'POST', body: form(confirmed ? { confirmPriceChanges: 'true' } : {}) });
      setApplied(result);
      setPreview(null);
      setFile(null);
      setConfirmed(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The sheet could not be applied. Nothing was changed.');
    } finally {
      setBusy(null);
    }
  }

  const changes = preview ? preview.totals.toCreate + preview.totals.toUpdate : 0;
  const blocked = !!preview?.needsConfirmation && !confirmed;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-28 sm:px-6">
      <div>
        <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#3D4FE0]">
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
        <h1 className="mt-2 font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
          Bulk upload
        </h1>
        <p className="mt-1 max-w-2xl text-[#6B7280]">
          Add or edit many products at once from an Excel sheet. You see everything it would change before anything is saved.
        </p>
      </div>

      {applied && (
        <Notice tone="good">
          <p className="font-semibold">“{applied.fileName}” was applied.</p>
          <p>
            {applied.totals.toCreate} added, {applied.totals.toUpdate} updated, {applied.totals.unchanged} unchanged
            {applied.totals.rejected > 0 && `, ${applied.totals.rejected} rows left out`}. The shop shows the changes within a minute.{' '}
            <Link to="/admin/products" className="font-semibold underline underline-offset-2">
              See the products
            </Link>
          </p>
        </Notice>
      )}

      <DownloadSheet />

      <Section step="2" title="Upload the filled-in sheet" aside={<span className="text-xs text-[#6B7280]">.xlsx or .csv, up to 1,000 products</span>}>
        <div className="p-5">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xlsm,.csv"
            className="hidden"
            onChange={(e) => {
              choose(e.target.files?.[0] ?? null);
              e.target.value = '';
            }}
          />
          {file ? (
            <div className="flex items-stretch overflow-hidden rounded-xl border border-[#E5E7EB]">
              <div className="flex w-14 shrink-0 items-center justify-center border-r border-[#E5E7EB] bg-[#F5F8FC]">
                <FileSpreadsheet className="h-5 w-5 text-[#061A40]" />
              </div>
              <div className="min-w-0 flex-1 px-4 py-3">
                <p className="truncate text-sm font-semibold text-[#061A40]">{file.name}</p>
                <p className="text-xs text-[#6B7280]">{fileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => choose(null)}
                aria-label="Remove this file"
                className="flex w-12 shrink-0 items-center justify-center border-l border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#061A40] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                choose(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`flex w-full flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? 'border-[#3D4FE0] bg-[#EEF0FD]' : 'border-[#C2C7D0] bg-[#F5F8FC] hover:border-[#3D4FE0]'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Upload className="h-5 w-5 text-[#3D4FE0]" />
              </span>
              <span className="mt-3 text-sm font-semibold text-[#061A40]">Choose the sheet, or drop it here</span>
              <span className="mt-1 text-xs text-[#6B7280]">Rows with a Product ID edit that product; rows without one add a new product.</span>
            </button>
          )}
        </div>
        <div className="border-t border-[#E5E7EB] p-3">
          <button type="button" onClick={check} disabled={!file || busy !== null} className={`${PRIMARY} group h-12 w-full`}>
            {busy === 'checking' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Checking…
              </>
            ) : (
              <>
                Check sheet
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-[#6B7280]">Checking changes nothing.</p>
        </div>
      </Section>

      {error && <Notice tone="error">{error}</Notice>}

      {preview && (
        <>
          <Section step="3" title="What this sheet would change" aside={<span className="text-xs text-[#6B7280]">{preview.totals.rows.toLocaleString('en-IN')} rows read</span>}>
            <div className="grid grid-cols-2 gap-px overflow-hidden bg-[#E5E7EB] sm:grid-cols-4">
              <Stat label="New products" value={preview.totals.toCreate} tone="good" />
              <Stat label="Updated" value={preview.totals.toUpdate} tone="good" />
              <Stat label="Unchanged" value={preview.totals.unchanged} tone="plain" />
              <Stat label="Rows left out" value={preview.totals.rejected} tone="bad" />
            </div>
            <div className="border-t border-[#E5E7EB] px-5 py-4">
              <span className="text-xs font-semibold text-[#6B7280]">Columns read (headings on row {preview.headerRowNumber})</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preview.columnsRead.map((heading) => (
                  <span key={heading} className="rounded-lg border border-[#E5E7EB] bg-[#F5F8FC] px-2 py-1 text-xs text-[#061A40]">
                    {heading}
                  </span>
                ))}
              </div>
              {preview.ignoredHeadings.length > 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  Not read, as the heading is not one this page knows: {preview.ignoredHeadings.map((h) => `“${h}”`).join(', ')}
                </p>
              )}
            </div>
          </Section>

          {preview.newBrands.length > 0 && (
            <Notice tone="warn">
              <p>
                New brand{preview.newBrands.length === 1 ? '' : 's'} to be added: <strong>{preview.newBrands.join(', ')}</strong>. If one is a typo of a brand
                already listed, fix it in the sheet first.
              </p>
            </Notice>
          )}

          {preview.priceAlerts.length > 0 && (
            <section className={`${CARD} overflow-hidden border-amber-200`}>
              <div className="border-b border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800">
                <p className="font-semibold">Large price changes: please check</p>
                <p>{preview.needsConfirmation}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className={TH}>Row</th>
                      <th className={TH}>Product</th>
                      <th className={TH}>Price now</th>
                      <th className={TH}>In the sheet</th>
                      <th className={TH}>Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {preview.priceAlerts.map((a) => (
                      <tr key={a.slug}>
                        <td className={`${TD} tabular-nums text-[#6B7280]`}>{a.rowNumber}</td>
                        <td className={TD}>{a.name}</td>
                        <td className={`${TD} tabular-nums`}>{rupees(a.fromPaise)}</td>
                        <td className={`${TD} tabular-nums`}>{a.toPaise ? rupees(a.toPaise) : '—'}</td>
                        <td className={`${TD} font-bold tabular-nums text-amber-600`}>
                          {a.percent > 0 ? '+' : ''}
                          {a.percent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <label className="flex cursor-pointer items-center gap-2 border-t border-[#E5E7EB] px-5 py-3.5 text-sm font-medium text-[#061A40]">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="h-4 w-4 accent-[#3D4FE0]" />
                These prices are right. Apply them.
              </label>
            </section>
          )}

          {preview.issues.length > 0 && (
            <section className={`${CARD} overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] px-5 py-3.5">
                <h2 className="font-dm-sans text-base font-bold text-[#061A40]">Problems and notes</h2>
                <span className="text-xs text-[#6B7280]">
                  {preview.totals.rejected} row{preview.totals.rejected === 1 ? '' : 's'} left out · {preview.totals.warnings} note
                  {preview.totals.warnings === 1 ? '' : 's'}
                </span>
              </div>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className={TH}>Row</th>
                      <th className={TH}>Product</th>
                      <th className={TH}>What to fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {preview.issues.map((issue, i) => (
                      <tr key={i}>
                        <td className={`${TD} tabular-nums text-[#6B7280]`}>{issue.rowNumber}</td>
                        <td className={`${TD} max-w-[260px] truncate`} title={issue.product ?? undefined}>
                          {issue.product ?? '—'}
                        </td>
                        <td className={TD}>
                          <span
                            className={`mr-2 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                              issue.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {issue.severity === 'error' ? 'Left out' : 'Note'}
                          </span>
                          {issue.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {preview.updated.length > 0 && (
            <section className={`${CARD} overflow-hidden`}>
              <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] px-5 py-3.5">
                <h2 className="font-dm-sans text-base font-bold text-[#061A40]">Products to update</h2>
                {preview.totals.toUpdate > preview.updated.length && (
                  <span className="text-xs text-[#6B7280]">First {preview.updated.length} of {preview.totals.toUpdate}</span>
                )}
              </div>
              <ul className="max-h-[520px] divide-y divide-[#E5E7EB] overflow-auto">
                {preview.updated.map((u) => (
                  <li key={u.slug} className="px-5 py-3.5">
                    <p className="text-sm">
                      <span className="mr-2 tabular-nums text-[#6B7280]">Row {u.rowNumber}</span>
                      <Link to={`/admin/products/${u.slug}`} className="font-semibold text-[#061A40] hover:text-[#3D4FE0]">
                        {u.name}
                      </Link>
                    </p>
                    <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-[180px_minmax(0,1fr)]">
                      {u.changes.map((c) => (
                        <div key={c.field} className="contents">
                          <dt className="text-[#6B7280]">{fieldLabel(c.field)}</dt>
                          <dd className="min-w-0 break-words text-[#061A40]">
                            <span className="text-[#6B7280] line-through decoration-[#C2C7D0]">{shown(c.field, c.from)}</span>
                            <ArrowRight className="mx-1.5 inline h-3.5 w-3.5 text-[#3D4FE0]" />
                            <span className="font-medium">{shown(c.field, c.to)}</span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {preview.created.length > 0 && (
            <section className={`${CARD} overflow-hidden`}>
              <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] px-5 py-3.5">
                <h2 className="font-dm-sans text-base font-bold text-[#061A40]">Products to add</h2>
                {preview.totals.toCreate > preview.created.length && (
                  <span className="text-xs text-[#6B7280]">First {preview.created.length} of {preview.totals.toCreate}</span>
                )}
              </div>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className={TH}>Row</th>
                      <th className={TH}>Title</th>
                      <th className={TH}>Category</th>
                      <th className={TH}>Status</th>
                      <th className={TH}>Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {preview.created.map((c) => (
                      <tr key={c.rowNumber}>
                        <td className={`${TD} tabular-nums text-[#6B7280]`}>{c.rowNumber}</td>
                        <td className={TD}>{c.name}</td>
                        <td className={TD}>{c.category}</td>
                        <td className={TD}>{STATUS_LABEL[c.status]}</td>
                        <td className={`${TD} tabular-nums`}>{c.priceInPaise ? rupees(c.priceInPaise) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 text-sm text-[#6B7280]">
                {changes === 0
                  ? 'Nothing to apply: every row is unchanged or has a problem to fix.'
                  : `${preview.totals.toCreate} to add, ${preview.totals.toUpdate} to update.${preview.totals.rejected ? ' Rows with a problem are left out: fix them in the sheet and upload it again.' : ''}`}
              </p>
              <button type="button" onClick={apply} disabled={changes === 0 || blocked || busy !== null} className={`${PRIMARY} h-11`}>
                {busy === 'applying' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Apply {changes > 0 ? changes.toLocaleString('en-IN') : ''} change{changes === 1 ? '' : 's'}
              </button>
            </div>
            {blocked && <p className="mt-1 text-xs text-amber-700">Tick the box under the price changes first.</p>}
          </div>
        </>
      )}
    </main>
  );
}

export default function BulkUpload() {
  return (
    <AdminShell>
      <BulkUploadPage />
    </AdminShell>
  );
}
