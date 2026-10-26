import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, FileSpreadsheet, Loader2, ShieldAlert, Upload, X } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuthStore } from '../../auth-store';
import { ApiError, apiFetch } from '../../lib/api-client';

/* The admin page for the SAP product sheet.

   Uploading is two steps, mirroring the backend: "Check sheet" sends the
   file for a preview — what it would add, change and reject — and writes
   nothing; "Apply" sends the same file again to make those changes. The
   person uploading always sees what will happen before it does. */

type Mode = 'partial' | 'full';
type Field = 'sapCode' | 'sapName' | 'modelName' | 'stock' | 'mrp' | 'mop' | 'brand' | 'partNumber' | 'ean' | 'itemGroup';

interface Issue {
  rowNumber: number;
  sapCode: string | null;
  severity: 'error' | 'warning';
  field: string;
  message: string;
}

interface Change {
  field: string;
  from: string | number | null;
  to: string | number | null;
}

interface Summary {
  fileName: string;
  mode: Mode;
  headerRowNumber: number;
  columns: Partial<Record<Field, string>>;
  unrecognisedHeadings: string[];
  totals: {
    rows: number;
    valid: number;
    rejected: number;
    warnings: number;
    toCreate: number;
    toUpdate: number;
    unchanged: number;
    missing: number;
  };
  needsConfirmation: string | null;
  issues: Issue[];
  samples: {
    created: { sapCode: string; modelName: string; stock: number; mopInPaise: number; mrpInPaise: number }[];
    updated: { sapCode: string; modelName: string; returning: boolean; changes: Change[] }[];
    missing: { sapCode: string; modelName: string; stock: number }[];
    priceAlerts: { sapCode: string; modelName: string; fromPaise: number; toPaise: number; percent: number }[];
  };
}

interface Applied extends Summary {
  importId: string;
  appliedAt: string;
}

interface HistoryEntry {
  id: string;
  fileName: string;
  mode: Mode;
  uploadedBy: string;
  appliedAt: string;
  totals: { rows: number; created: number; updated: number; unchanged: number; rejected: number; missing: number };
}

interface Catalogue {
  inFeed: number;
  inStock: number;
}

const FIELD_LABELS: Record<Field, string> = {
  sapCode: 'SAP code',
  sapName: 'SAP name',
  modelName: 'Model name for website',
  stock: 'Available stock',
  mrp: 'MRP',
  mop: 'MOP',
  brand: 'Brand',
  partNumber: 'Part number',
  ean: 'EAN / barcode',
  itemGroup: 'Item group',
};
const FIELD_ORDER = Object.keys(FIELD_LABELS) as Field[];

const CHANGE_LABELS: Record<string, string> = {
  sapName: 'SAP name',
  modelName: 'Model name',
  stock: 'Stock',
  mrpInPaise: 'MRP',
  mopInPaise: 'MOP',
  brand: 'Brand',
  partNumber: 'Part number',
  ean: 'EAN',
  itemGroup: 'Item group',
};

const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;
const changeValue = (field: string, value: string | number | null) =>
  value === null || value === '' ? '—' : field.endsWith('InPaise') ? rupees(Number(value)) : String(value);
const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-shop-line px-5 py-2.5">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, tone = 'plain' }: { label: string; value: number; tone?: 'plain' | 'good' | 'bad' | 'warn' }) {
  const colour =
    value === 0
      ? 'text-shop-ink/30'
      : tone === 'good'
        ? 'text-shop-accent'
        : tone === 'bad'
          ? 'text-red-600'
          : tone === 'warn'
            ? 'text-amber-600'
            : 'text-shop-ink';
  return (
    <div className="bg-white px-4 py-3.5">
      <span className={`block ${MICRO_LABEL}`}>{label}</span>
      <span className={`mt-1 block font-mono text-2xl font-bold tabular-nums leading-none ${colour}`}>{value.toLocaleString('en-IN')}</span>
    </div>
  );
}

function Notice({ tone, children }: { tone: 'error' | 'warn' | 'good'; children: ReactNode }) {
  const style =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-shop-accent/30 bg-[#F3F4FE] text-shop-ink';
  const Icon = tone === 'good' ? Check : AlertTriangle;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${style}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const TH = 'px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';
const TD = 'px-4 py-2.5 align-top text-sm text-shop-ink/80';

function SapImportScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('partial');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<'checking' | 'applying' | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Summary | null>(null);
  const [applied, setApplied] = useState<Applied | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    apiFetch<HistoryEntry[]>('/admin/sap-import/history')
      .then(setHistory)
      .catch(() => setHistory([]));
    apiFetch<{ catalogue: Catalogue }>('/admin/sap-import/items?pageSize=1')
      .then((data) => setCatalogue(data.catalogue))
      .catch(() => setCatalogue(null));
  }, []);

  useEffect(refresh, [refresh]);

  function choose(next: File | null) {
    setFile(next);
    setPreview(null);
    setApplied(null);
    setConfirmed(false);
    setError('');
  }

  function changeMode(next: Mode) {
    setMode(next);
    // A preview is only true for the mode it was made in.
    setPreview(null);
    setConfirmed(false);
    setError('');
  }

  function form(extra: Record<string, string> = {}) {
    const data = new FormData();
    data.append('file', file as File);
    data.append('mode', mode);
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
      setPreview(await apiFetch<Summary>('/admin/sap-import/preview', { method: 'POST', body: form() }));
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
      const result = await apiFetch<Applied>('/admin/sap-import/apply', {
        method: 'POST',
        body: form(confirmed ? { confirmLargeRemoval: 'true' } : {}),
      });
      setApplied(result);
      setPreview(null);
      setFile(null);
      setConfirmed(false);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The sheet could not be applied. Nothing was changed.');
    } finally {
      setBusy(null);
    }
  }

  const nothingToDo = preview !== null && preview.totals.toCreate + preview.totals.toUpdate + preview.totals.missing === 0;
  const blocked = preview?.needsConfirmation ? !confirmed : false;

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6">
        {/* Title */}
        <div className="flex items-stretch overflow-hidden rounded-2xl border border-shop-line bg-white">
          <div className="hidden w-20 shrink-0 items-center justify-center border-r border-shop-line bg-shop-canvas sm:flex">
            <FileSpreadsheet className="h-7 w-7 text-shop-ink" />
          </div>
          <div className="min-w-0 flex-1 px-5 py-4">
            <span className={`flex items-center gap-2 ${MICRO_LABEL}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-shop-accent" aria-hidden="true" />
              Admin
            </span>
            <h1 className="mt-1 text-2xl font-semibold text-shop-ink sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
              SAP product sheet
            </h1>
            <p className="mt-1 text-sm text-shop-ink/55">Upload the SAP export to update product codes, stock, MRP and MOP.</p>
          </div>
          {catalogue && (
            <>
              <div className="flex shrink-0 flex-col justify-center border-l border-shop-line px-4 sm:px-5">
                <span className={MICRO_LABEL}>In feed</span>
                <span className="mt-0.5 font-mono text-xl font-bold tabular-nums leading-none text-shop-ink">
                  {catalogue.inFeed.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex shrink-0 flex-col justify-center border-l border-shop-line px-4 sm:px-5">
                <span className={MICRO_LABEL}>In stock</span>
                <span className="mt-0.5 font-mono text-xl font-bold tabular-nums leading-none text-shop-ink">
                  {catalogue.inStock.toLocaleString('en-IN')}
                </span>
              </div>
            </>
          )}
        </div>

        {applied && (
          <Notice tone="good">
            <p className="font-semibold">“{applied.fileName}” was applied.</p>
            <p>
              {applied.totals.toCreate} added, {applied.totals.toUpdate} updated, {applied.totals.unchanged} unchanged
              {applied.totals.rejected > 0 && `, ${applied.totals.rejected} rows rejected`}
              {applied.totals.missing > 0 && `, ${applied.totals.missing} marked out of stock`}.
            </p>
          </Notice>
        )}

        {/* Step 1 — the sheet */}
        <Card title="1 · Choose the sheet" aside={<span className="font-mono text-[11px] text-shop-ink/45">.xlsx or .csv</span>}>
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
              <div className="flex items-stretch overflow-hidden rounded-xl border border-shop-line">
                <div className="flex w-14 shrink-0 items-center justify-center border-r border-shop-line bg-shop-canvas">
                  <FileSpreadsheet className="h-5 w-5 text-shop-ink" />
                </div>
                <div className="min-w-0 flex-1 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-shop-ink">{file.name}</p>
                  <p className="font-mono text-[11px] text-shop-ink/45">{fileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => choose(null)}
                  aria-label="Remove this file"
                  className="flex w-12 shrink-0 items-center justify-center border-l border-shop-line text-shop-ink/50 transition-colors hover:bg-shop-ink hover:text-white"
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
                  dragging ? 'border-shop-accent bg-[#F3F4FE]' : 'border-shop-ink/25 bg-shop-canvas hover:border-shop-accent'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <Upload className="h-5 w-5 text-shop-ink/60" />
                </span>
                <span className="mt-3 text-sm font-semibold text-shop-ink">Choose the SAP sheet, or drop it here</span>
                <span className="mt-1 text-xs text-shop-ink/55">
                  Columns needed: SAP code, SAP name, model name for website, available stock, MRP, MOP
                </span>
              </button>
            )}

            {/* What the sheet covers */}
            <span className={`mt-5 block ${MICRO_LABEL}`}>What does this sheet cover?</span>
            <div className="mt-2 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-shop-line bg-shop-line sm:grid-cols-2">
              {(
                [
                  ['partial', 'Some products', 'Update only the products listed. Everything else is left exactly as it is.'],
                  ['full', 'The whole catalogue', 'Anything the sheet leaves out is marked out of stock.'],
                ] as const
              ).map(([value, title, detail]) => {
                const on = mode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => changeMode(value)}
                    className={`px-4 py-3 text-left transition-colors ${on ? 'bg-shop-ink text-white' : 'bg-white text-shop-ink hover:bg-shop-canvas'}`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${on ? 'border-white bg-white text-shop-ink' : 'border-shop-ink/30'}`}>
                        {on && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                      </span>
                      {title}
                    </span>
                    <span className={`mt-1 block text-xs leading-relaxed ${on ? 'text-white/65' : 'text-shop-ink/55'}`}>{detail}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-shop-line p-3">
            <button
              type="button"
              onClick={check}
              disabled={!file || busy !== null}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-shop-ink"
            >
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
            <p className="mt-2 text-center text-[11px] text-shop-ink/45">Checking changes nothing. You see what would happen first.</p>
          </div>
        </Card>

        {error && <Notice tone="error">{error}</Notice>}

        {/* Step 2 — what it would change */}
        {preview && (
          <>
            <Card
              title="2 · What this sheet would change"
              aside={<span className="font-mono text-[11px] text-shop-ink/45">{preview.totals.rows.toLocaleString('en-IN')} rows read</span>}
            >
              <div className="grid grid-cols-2 gap-px bg-shop-line sm:grid-cols-3 lg:grid-cols-5">
                <Stat label="New products" value={preview.totals.toCreate} tone="good" />
                <Stat label="Updated" value={preview.totals.toUpdate} tone="good" />
                <Stat label="Unchanged" value={preview.totals.unchanged} />
                <Stat label="Rows rejected" value={preview.totals.rejected} tone="bad" />
                <Stat label="Out of stock" value={preview.totals.missing} tone="warn" />
              </div>

              {/* How the columns were read */}
              <div className="border-t border-shop-line px-5 py-4">
                <span className={MICRO_LABEL}>Columns read (headings on row {preview.headerRowNumber})</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {FIELD_ORDER.map((field) => {
                    const heading = preview.columns[field];
                    return (
                      <span
                        key={field}
                        className={`flex items-stretch overflow-hidden rounded-lg border text-xs ${
                          heading ? 'border-shop-line text-shop-ink' : 'border-dashed border-shop-ink/20 text-shop-ink/40'
                        }`}
                      >
                        <span className="bg-shop-canvas px-2 py-1 font-medium">{FIELD_LABELS[field]}</span>
                        <span className="border-l border-shop-line px-2 py-1 font-mono">{heading ? `“${heading}”` : 'not in sheet'}</span>
                      </span>
                    );
                  })}
                </div>
                {preview.unrecognisedHeadings.length > 0 && (
                  <p className="mt-2 text-xs text-shop-ink/55">
                    Ignored columns: {preview.unrecognisedHeadings.map((h) => `“${h}”`).join(', ')}
                  </p>
                )}
              </div>
            </Card>

            {preview.needsConfirmation && (
              <Notice tone="warn">
                <p className="font-semibold">This would take most of the catalogue out of stock.</p>
                <p>{preview.needsConfirmation}</p>
                <label className="mt-2 flex cursor-pointer items-center gap-2 font-medium">
                  <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="h-4 w-4 accent-amber-600" />
                  Yes, this sheet is the whole catalogue. Mark the rest out of stock.
                </label>
              </Notice>
            )}

            {preview.samples.priceAlerts.length > 0 && (
              <Card
                title="Large price changes — please check"
                aside={<span className="font-mono text-[11px] text-amber-600">{preview.samples.priceAlerts.length}</span>}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead>
                      <tr className="border-b border-shop-line">
                        <th className={TH}>SAP code</th>
                        <th className={TH}>Product</th>
                        <th className={TH}>MOP now</th>
                        <th className={TH}>MOP in sheet</th>
                        <th className={TH}>Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shop-line">
                      {preview.samples.priceAlerts.map((alert) => (
                        <tr key={alert.sapCode}>
                          <td className={`${TD} font-mono`}>{alert.sapCode}</td>
                          <td className={TD}>{alert.modelName}</td>
                          <td className={`${TD} font-mono tabular-nums`}>{rupees(alert.fromPaise)}</td>
                          <td className={`${TD} font-mono tabular-nums`}>{rupees(alert.toPaise)}</td>
                          <td className={`${TD} font-mono font-bold tabular-nums text-amber-600`}>
                            {alert.percent > 0 ? '+' : ''}
                            {alert.percent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {preview.issues.length > 0 && (
              <Card
                title="Problems found in the sheet"
                aside={
                  <span className="font-mono text-[11px] text-shop-ink/45">
                    {preview.totals.rejected} rejected · {preview.totals.warnings} adjusted
                  </span>
                }
              >
                <div className="max-h-[26rem] overflow-auto">
                  <table className="w-full min-w-[560px]">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-shop-line">
                        <th className={TH}>Row</th>
                        <th className={TH}>SAP code</th>
                        <th className={TH}>Result</th>
                        <th className={TH}>What is wrong</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shop-line">
                      {preview.issues.map((issue, i) => (
                        <tr key={i}>
                          <td className={`${TD} font-mono tabular-nums`}>{issue.rowNumber}</td>
                          <td className={`${TD} font-mono`}>{issue.sapCode ?? '—'}</td>
                          <td className={TD}>
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
                                issue.severity === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {issue.severity === 'error' ? 'Row skipped' : 'Adjusted'}
                            </span>
                          </td>
                          <td className={TD}>{issue.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {preview.samples.created.length > 0 && (
              <Card
                title="New products"
                aside={
                  <span className="font-mono text-[11px] text-shop-ink/45">
                    showing {preview.samples.created.length} of {preview.totals.toCreate}
                  </span>
                }
              >
                <div className="max-h-80 overflow-auto">
                  <table className="w-full min-w-[520px]">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-shop-line">
                        <th className={TH}>SAP code</th>
                        <th className={TH}>Model name</th>
                        <th className={TH}>Stock</th>
                        <th className={TH}>MRP</th>
                        <th className={TH}>MOP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shop-line">
                      {preview.samples.created.map((item) => (
                        <tr key={item.sapCode}>
                          <td className={`${TD} font-mono`}>{item.sapCode}</td>
                          <td className={TD}>{item.modelName}</td>
                          <td className={`${TD} font-mono tabular-nums`}>{item.stock}</td>
                          <td className={`${TD} font-mono tabular-nums`}>{rupees(item.mrpInPaise)}</td>
                          <td className={`${TD} font-mono tabular-nums`}>{rupees(item.mopInPaise)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {preview.samples.updated.length > 0 && (
              <Card
                title="Updated products"
                aside={
                  <span className="font-mono text-[11px] text-shop-ink/45">
                    showing {preview.samples.updated.length} of {preview.totals.toUpdate}
                  </span>
                }
              >
                <ul className="max-h-80 divide-y divide-shop-line overflow-auto">
                  {preview.samples.updated.map((item) => (
                    <li key={item.sapCode} className="px-5 py-3">
                      <p className="text-sm font-semibold text-shop-ink">
                        <span className="font-mono font-normal text-shop-ink/45">{item.sapCode}</span> {item.modelName}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.returning && (
                          <span className="rounded-lg bg-[#F3F4FE] px-2 py-1 text-xs font-medium text-shop-accent">Back in the feed</span>
                        )}
                        {item.changes.map((change) => (
                          <span key={change.field} className="rounded-lg border border-shop-line px-2 py-1 text-xs text-shop-ink/75">
                            <span className="font-medium text-shop-ink">{CHANGE_LABELS[change.field] ?? change.field}</span>{' '}
                            <span className="font-mono">
                              {changeValue(change.field, change.from)} → {changeValue(change.field, change.to)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {preview.samples.missing.length > 0 && (
              <Card
                title="Not in this sheet — will be marked out of stock"
                aside={
                  <span className="font-mono text-[11px] text-amber-600">
                    showing {preview.samples.missing.length} of {preview.totals.missing}
                  </span>
                }
              >
                <ul className="max-h-64 divide-y divide-shop-line overflow-auto">
                  {preview.samples.missing.map((item) => (
                    <li key={item.sapCode} className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm">
                      <span className="min-w-0 truncate text-shop-ink/80">
                        <span className="font-mono text-shop-ink/45">{item.sapCode}</span> {item.modelName}
                      </span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-shop-ink/55">stock {item.stock} → 0</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Apply */}
            <div className="overflow-hidden rounded-2xl border border-shop-line bg-white p-3">
              {nothingToDo ? (
                <p className="px-2 py-2 text-center text-sm text-shop-ink/60">
                  Nothing to apply — every product in this sheet already matches what is stored.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={apply}
                    disabled={busy !== null || blocked}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-shop-accent text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-shop-accent"
                  >
                    {busy === 'applying' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Applying…
                      </>
                    ) : (
                      <>
                        Apply {(preview.totals.toCreate + preview.totals.toUpdate + preview.totals.missing).toLocaleString('en-IN')} changes
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                  {preview.totals.rejected > 0 && (
                    <p className="mt-2 text-center text-[11px] text-shop-ink/55">
                      The {preview.totals.rejected} rejected {preview.totals.rejected === 1 ? 'row' : 'rows'} will be left out. Fix them in the
                      sheet and upload it again to include them.
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* History */}
        <Card
          title="Previous imports"
          aside={history && history.length > 0 ? <span className="font-mono text-[11px] text-shop-ink/45">last {history.length}</span> : undefined}
        >
          {history === null ? (
            <p className="px-5 py-6 text-sm text-shop-ink/45">Loading…</p>
          ) : history.length === 0 ? (
            <p className="px-5 py-6 text-sm text-shop-ink/55">No sheet has been applied yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-shop-line">
                    <th className={TH}>Applied</th>
                    <th className={TH}>File</th>
                    <th className={TH}>By</th>
                    <th className={TH}>Type</th>
                    <th className={TH}>Added</th>
                    <th className={TH}>Updated</th>
                    <th className={TH}>Rejected</th>
                    <th className={TH}>Out of stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-shop-line">
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td className={`${TD} whitespace-nowrap`}>{when(entry.appliedAt)}</td>
                      <td className={`${TD} max-w-[14rem] truncate`} title={entry.fileName}>
                        {entry.fileName}
                      </td>
                      <td className={TD}>{entry.uploadedBy}</td>
                      <td className={TD}>{entry.mode === 'full' ? 'Whole catalogue' : 'Some products'}</td>
                      <td className={`${TD} font-mono tabular-nums`}>{entry.totals.created}</td>
                      <td className={`${TD} font-mono tabular-nums`}>{entry.totals.updated}</td>
                      <td className={`${TD} font-mono tabular-nums`}>{entry.totals.rejected}</td>
                      <td className={`${TD} font-mono tabular-nums`}>{entry.totals.missing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Footer />
    </div>
  );
}

/** Signed-in admins only. The backend enforces this on every request; this
 *  check just avoids showing a non-admin a page whose every button would
 *  be refused. */
function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  if (user?.role !== 'ADMIN') {
    return (
      <div className="w-full bg-shop-canvas">
        <div className="bg-[#ECEDEC]">
          <Header />
        </div>
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-shop-ink/20 bg-white px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-shop-canvas">
              <ShieldAlert className="h-6 w-6 text-shop-ink/40" />
            </span>
            <p className="mt-4 text-base font-semibold text-shop-ink">This page is for administrators</p>
            <p className="mt-1 text-sm text-shop-ink/55">Your account does not have access to the SAP import.</p>
            <Link
              to="/"
              className="mt-6 flex h-12 items-center rounded-xl bg-shop-ink px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
            >
              Back to the site
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return <>{children}</>;
}

export default function SapImport() {
  return (
    <ProtectedRoute>
      <AdminOnly>
        <SapImportScreen />
      </AdminOnly>
    </ProtectedRoute>
  );
}
