import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Check, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import AdminShell from './AdminShell';
import { ApiError, apiFetch } from '../../lib/api-client';
import SapLinker from '../../components/admin/SapLinker';
import SapMatches from './SapMatches';

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
  /** Codes linked to a website product — the ones whose prices reach the shop. */
  linked: number;
}

const FIELD_LABELS: Record<Field, string> = {
  sapCode: 'Item code',
  sapName: 'SAP name',
  modelName: 'Model name for website',
  stock: 'Available stock',
  mrp: 'MRP',
  mop: 'Selling price (MOP)',
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
  mopInPaise: 'Selling price',
  brand: 'Brand',
  partNumber: 'Part number',
  ean: 'EAN',
  itemGroup: 'Item group',
};

/** The blank product sheet (public/admin/), with the exact columns, checks
 *  and dropdowns the import expects. */
const TEMPLATE_URL = '/admin/logica-product-update-template.xlsx';

const MICRO_LABEL = 'text-xs font-medium text-[#6B7280]';
const CARD = 'overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]';

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;
/** A price going down reads green, going up amber; other changes plain. */
const changeTone = (change: Change) => {
  if (!change.field.endsWith('InPaise') || typeof change.from !== 'number' || typeof change.to !== 'number') return 'border-[#E5E7EB] text-[#061A40]/75';
  return change.to < change.from ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800';
};
const changeValue = (field: string, value: string | number | null) =>
  value === null || value === '' ? '—' : field.endsWith('InPaise') ? rupees(Number(value)) : String(value);
const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

/** A card with a heading; "2 · What will change" gets a numbered step circle. */
function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  const step = /^(\d+) · (.*)$/.exec(title);
  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F6] px-5 py-3.5">
        <h2 className="flex items-center gap-3 font-dm-sans text-base font-bold text-[#061A40]">
          {step && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF0FD] text-xs font-bold text-[#3D4FE0]">{step[1]}</span>}
          {step ? step[2] : title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, tone = 'plain' }: { label: string; value: number; tone?: 'plain' | 'good' | 'bad' | 'warn' }) {
  const colour =
    value === 0 ? 'text-[#C2C7D0]' : tone === 'good' ? 'text-[#3D4FE0]' : tone === 'bad' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-[#061A40]';
  return (
    <div className="bg-white px-5 py-4">
      <span className={`block ${MICRO_LABEL}`}>{label}</span>
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
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${style}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const TH = 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]';
const TD = 'px-4 py-3 align-top text-sm text-[#061A40]';

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
    <div className="w-full">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-dm-sans text-3xl font-bold text-[#061A40]" style={{ letterSpacing: '-0.03em' }}>
              Prices & stock
            </h1>
            <p className="mt-1 max-w-2xl text-[#6B7280]">Upload the sheet from SAP. Prices and stock on the website change as soon as you save it.</p>
          </div>
          {/* The blank sheet with the exact columns this page reads. */}
          <a
            href={TEMPLATE_URL}
            download="Logica Product Update Template.xlsx"
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#061A40] transition-colors duration-300 hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
          >
            <Download className="h-4 w-4" />
            Download blank sheet
          </a>
        </div>

        {catalogue && (
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#E5E7EB] shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]">
            <Stat label="Item codes from SAP" value={catalogue.inFeed} />
            <Stat label="In stock" value={catalogue.inStock} />
            <Stat label="Linked to products" value={catalogue.linked ?? 0} tone="good" />
          </div>
        )}

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
        <Card title="1 · Choose the SAP sheet" aside={<span className="text-xs text-[#6B7280]">.xlsx or .csv</span>}>
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
                  className="flex w-12 shrink-0 items-center justify-center border-l border-[#E5E7EB] text-[#061A40]/50 transition-colors hover:bg-[#061A40] hover:text-white"
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
                  dragging ? 'border-[#3D4FE0] bg-[#F3F4FE]' : 'border-[#061A40]/25 bg-[#F5F8FC] hover:border-[#3D4FE0]'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <Upload className="h-5 w-5 text-[#061A40]/60" />
                </span>
                <span className="mt-3 text-sm font-semibold text-[#061A40]">Choose the SAP sheet, or drop it here</span>
                <span className="mt-1 text-xs text-[#6B7280]">
                  It needs these columns: item code, name, stock, MRP and selling price (MOP)
                </span>
              </button>
            )}

            {/* Everyday sheets update only what they list. The whole-catalogue
                mode (anything left out goes out of stock) is under Advanced. */}
            <details className="mt-5 rounded-xl border border-[#E5E7EB]" open={mode === 'full'}>
              <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-[#061A40]/70 hover:text-[#061A40]">Advanced</summary>
              <label className="flex cursor-pointer items-start gap-3 border-t border-[#E5E7EB] px-4 py-3">
                <input
                  type="checkbox"
                  checked={mode === 'full'}
                  onChange={(e) => changeMode(e.target.checked ? 'full' : 'partial')}
                  className="mt-0.5 h-4 w-4 accent-[#3D4FE0]"
                />
                <span className="text-sm leading-relaxed text-[#061A40]">
                  <span className="font-semibold">This sheet lists every product we sell.</span>
                  <span className="block text-xs text-[#061A40]/60">
                    Anything not in it is marked out of stock on the website. Leave this off unless the sheet is the full list from SAP.
                  </span>
                </span>
              </label>
            </details>
          </div>

          <div className="border-t border-[#E5E7EB] p-3">
            <button
              type="button"
              onClick={check}
              disabled={!file || busy !== null}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#061A40] text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#3D4FE0] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#061A40]"
            >
              {busy === 'checking' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                </>
              ) : (
                <>
                  Check what will change
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-[#6B7280]">Checking changes nothing. You see what would happen first.</p>
          </div>
        </Card>

        {error && <Notice tone="error">{error}</Notice>}

        {/* Step 2 — what it would change */}
        {preview && (
          <>
            <Card
              title="2 · What will change"
              aside={<span className="text-xs text-[#6B7280]">{preview.totals.rows.toLocaleString('en-IN')} rows read</span>}
            >
              <div className="grid grid-cols-2 gap-px bg-[#E5E7EB] sm:grid-cols-3 lg:grid-cols-5">
                <Stat label="New item codes" value={preview.totals.toCreate} tone="good" />
                <Stat label="Updated" value={preview.totals.toUpdate} tone="good" />
                <Stat label="Unchanged" value={preview.totals.unchanged} />
                <Stat label="Rows with problems" value={preview.totals.rejected} tone="bad" />
                <Stat label="Out of stock" value={preview.totals.missing} tone="warn" />
              </div>

              {/* How the columns were read */}
              <div className="border-t border-[#E5E7EB] px-5 py-4">
                <span className={MICRO_LABEL}>Columns read (headings on row {preview.headerRowNumber})</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {FIELD_ORDER.map((field) => {
                    const heading = preview.columns[field];
                    return (
                      <span
                        key={field}
                        className={`flex items-stretch overflow-hidden rounded-lg border text-xs ${
                          heading ? 'border-[#E5E7EB] text-[#061A40]' : 'border-dashed border-[#061A40]/20 text-[#061A40]/40'
                        }`}
                      >
                        <span className="bg-[#F5F8FC] px-2 py-1 font-medium">{FIELD_LABELS[field]}</span>
                        <span className="border-l border-[#E5E7EB] px-2 py-1">{heading ? `“${heading}”` : 'not in sheet'}</span>
                      </span>
                    );
                  })}
                </div>
                {preview.unrecognisedHeadings.length > 0 && (
                  <p className="mt-2 text-xs text-[#6B7280]">
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
                aside={<span className="text-xs font-medium text-amber-600">{preview.samples.priceAlerts.length}</span>}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className={TH}>Item code</th>
                        <th className={TH}>Product</th>
                        <th className={TH}>Price now</th>
                        <th className={TH}>New price</th>
                        <th className={TH}>Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {preview.samples.priceAlerts.map((alert) => (
                        <tr key={alert.sapCode}>
                          <td className={`${TD} font-medium`}>{alert.sapCode}</td>
                          <td className={TD}>{alert.modelName}</td>
                          <td className={`${TD} tabular-nums`}>{rupees(alert.fromPaise)}</td>
                          <td className={`${TD} tabular-nums`}>{rupees(alert.toPaise)}</td>
                          <td className={`${TD} font-bold tabular-nums text-amber-600`}>
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
                  <span className="text-xs text-[#6B7280]">
                    {preview.totals.rejected} rejected · {preview.totals.warnings} adjusted
                  </span>
                }
              >
                <div className="max-h-[26rem] overflow-auto">
                  <table className="w-full min-w-[560px]">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-[#E5E7EB]">
                        <th className={TH}>Row</th>
                        <th className={TH}>Item code</th>
                        <th className={TH}>Result</th>
                        <th className={TH}>What is wrong</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {preview.issues.map((issue, i) => (
                        <tr key={i}>
                          <td className={`${TD} tabular-nums`}>{issue.rowNumber}</td>
                          <td className={`${TD} font-medium`}>{issue.sapCode ?? '—'}</td>
                          <td className={TD}>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                issue.severity === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {issue.severity === 'error' ? 'Left out' : 'Changed'}
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
                title="New item codes"
                aside={
                  <span className="text-xs text-[#6B7280]">
                    showing {preview.samples.created.length} of {preview.totals.toCreate}
                  </span>
                }
              >
                <div className="max-h-80 overflow-auto">
                  <table className="w-full min-w-[520px]">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-[#E5E7EB]">
                        <th className={TH}>Item code</th>
                        <th className={TH}>Name</th>
                        <th className={TH}>Stock</th>
                        <th className={TH}>MRP</th>
                        <th className={TH}>Selling price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {preview.samples.created.map((item) => (
                        <tr key={item.sapCode}>
                          <td className={`${TD} font-medium`}>{item.sapCode}</td>
                          <td className={TD}>{item.modelName}</td>
                          <td className={`${TD} tabular-nums`}>{item.stock}</td>
                          <td className={`${TD} tabular-nums`}>{rupees(item.mrpInPaise)}</td>
                          <td className={`${TD} tabular-nums`}>{rupees(item.mopInPaise)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {preview.samples.updated.length > 0 && (
              <Card
                title="Price & stock changes"
                aside={
                  <span className="text-xs text-[#6B7280]">
                    showing {preview.samples.updated.length} of {preview.totals.toUpdate}
                  </span>
                }
              >
                <ul className="max-h-80 divide-y divide-[#E5E7EB] overflow-auto">
                  {preview.samples.updated.map((item) => (
                    <li key={item.sapCode} className="px-5 py-3">
                      <p className="text-sm font-semibold text-[#061A40]">
                        <span className="font-medium text-[#6B7280]">{item.sapCode}</span> {item.modelName}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.returning && (
                          <span className="rounded-lg bg-[#F3F4FE] px-2 py-1 text-xs font-medium text-[#3D4FE0]">Back in the feed</span>
                        )}
                        {item.changes.map((change) => (
                          <span key={change.field} className={`rounded-lg border px-2 py-1 text-xs ${changeTone(change)}`}>
                            <span className="font-medium text-[#061A40]">{CHANGE_LABELS[change.field] ?? change.field}</span>{' '}
                            <span className="tabular-nums">
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
                  <span className="text-xs font-medium text-amber-600">
                    showing {preview.samples.missing.length} of {preview.totals.missing}
                  </span>
                }
              >
                <ul className="max-h-64 divide-y divide-[#E5E7EB] overflow-auto">
                  {preview.samples.missing.map((item) => (
                    <li key={item.sapCode} className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm">
                      <span className="min-w-0 truncate text-[#061A40]/80">
                        <span className="font-medium text-[#6B7280]">{item.sapCode}</span> {item.modelName}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-[#6B7280]">stock {item.stock} → 0</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Apply */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-3">
              {nothingToDo ? (
                <p className="px-2 py-2 text-center text-sm text-[#061A40]/60">
                  Nothing to apply — every product in this sheet already matches what is stored.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={apply}
                    disabled={busy !== null || blocked}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3D4FE0] text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#061A40] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#3D4FE0]"
                  >
                    {busy === 'applying' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Applying…
                      </>
                    ) : (
                      <>
                        Save {(preview.totals.toCreate + preview.totals.toUpdate + preview.totals.missing).toLocaleString('en-IN')} changes
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                  {preview.totals.rejected > 0 && (
                    <p className="mt-2 text-center text-xs text-[#6B7280]">
                      The {preview.totals.rejected} rejected {preview.totals.rejected === 1 ? 'row' : 'rows'} will be left out. Fix them in the
                      sheet and upload it again to include them.
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Linking codes to website products. Remounted after each applied
            sheet so it lists the new codes. */}
        <SapMatches refreshKey={applied?.importId ?? 'feed'} onLinked={refresh} />

        <SapLinker key={applied?.importId ?? 'feed'} onChanged={refresh} />

        {/* History */}
        <Card
          title="Sheets saved before"
          aside={history && history.length > 0 ? <span className="text-xs text-[#6B7280]">last {history.length}</span> : undefined}
        >
          {history === null ? (
            <p className="px-5 py-6 text-sm text-[#6B7280]">Loading…</p>
          ) : history.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#6B7280]">No sheet has been saved yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
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
                <tbody className="divide-y divide-[#E5E7EB]">
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td className={`${TD} whitespace-nowrap`}>{when(entry.appliedAt)}</td>
                      <td className={`${TD} max-w-[14rem] truncate`} title={entry.fileName}>
                        {entry.fileName}
                      </td>
                      <td className={TD}>{entry.uploadedBy}</td>
                      <td className={TD}>{entry.mode === 'full' ? 'Whole catalogue' : 'Some products'}</td>
                      <td className={`${TD} tabular-nums`}>{entry.totals.created}</td>
                      <td className={`${TD} tabular-nums`}>{entry.totals.updated}</td>
                      <td className={`${TD} tabular-nums`}>{entry.totals.rejected}</td>
                      <td className={`${TD} tabular-nums`}>{entry.totals.missing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function SapImport() {
  return (
    <AdminShell>
      <SapImportScreen />
    </AdminShell>
  );
}
