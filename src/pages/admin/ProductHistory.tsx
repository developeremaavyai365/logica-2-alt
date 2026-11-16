import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, History, Loader2 } from 'lucide-react';
import { ApiError, apiFetch } from '../../lib/api-client';
import { type ChangeValue, fieldLabel, shownValue } from './change-format';

/* A product's change history: who changed what and when, field by field,
   newest first. Covers the listing form, bulk sheets, the products list's
   on/off switch, deleting and restoring, and SAP codes linked to it. */

interface Entry {
  id: string;
  at: string;
  actor: string;
  title: string;
  detail: string | null;
  changes: { field: string; from: ChangeValue; to: ChangeValue }[];
}

interface Page {
  entries: Entry[];
  next: string | null;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Long text (a description) is cut short; the whole of it is in the form. */
const clip = (text: string) => (text.length > 160 ? `${text.slice(0, 160)}…` : text);

export default function ProductHistory({ slug, refreshKey }: { slug: string; refreshKey: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (before?: string) => {
      const page = await apiFetch<Page>(`/admin/products/${slug}/history${before ? `?before=${encodeURIComponent(before)}` : ''}`);
      setNext(page.next);
      return page.entries;
    },
    [slug],
  );

  // Reloaded after each save, so the new change shows at the top.
  useEffect(() => {
    let live = true;
    setError('');
    load()
      .then((list) => live && setEntries(list))
      .catch((err) => live && setError(err instanceof ApiError ? err.message : 'Could not load the history.'));
    return () => {
      live = false;
    };
  }, [load, refreshKey]);

  async function more() {
    if (!next) return;
    setLoadingMore(true);
    try {
      const older = await load(next);
      setEntries((list) => [...(list ?? []), ...older]);
    } catch {
      setError('Could not load older changes.');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section id="history" className="rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.12)]">
      <div className="flex items-start gap-3 border-b border-[#EEF0F6] px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FF] text-[#3D4FE0]">
          <History className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="font-dm-sans text-[17px] font-bold text-[#061A40]">History</h2>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Every change to this listing, who made it and when. Price and stock updates from SAP imports are on the SAP import page.
          </p>
        </div>
      </div>

      {error && <p className="px-5 py-4 text-sm text-red-600">{error}</p>}
      {!entries && !error && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#9CA3AF]" />
        </div>
      )}
      {entries && entries.length === 0 && <p className="px-5 py-6 text-sm text-[#6B7280]">No changes recorded yet.</p>}

      {entries && entries.length > 0 && (
        <ol className="px-5 py-2">
          {entries.map((e, i) => (
            <li key={e.id} className="relative flex gap-4 py-3">
              {/* The timeline line between dots. */}
              {i < entries.length - 1 && <span className="absolute left-[5px] top-6 h-full w-px bg-[#E5E7EB]" aria-hidden="true" />}
              <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[#3D4FE0] bg-white" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#061A40]">{e.title}</p>
                <p className="text-xs text-[#6B7280]">
                  {e.actor} · <time dateTime={e.at}>{when(e.at)}</time>
                </p>
                {e.detail && <p className="mt-1 text-xs text-[#6B7280]">{e.detail}</p>}
                {e.changes.length > 0 && (
                  <dl className="mt-2 grid gap-x-4 gap-y-1 rounded-xl bg-[#F8F9FC] px-3.5 py-2.5 text-[13px] sm:grid-cols-[150px_minmax(0,1fr)]">
                    {e.changes.map((c) => (
                      <div key={c.field} className="contents">
                        <dt className="text-[#6B7280]">{fieldLabel(c.field)}</dt>
                        <dd className="min-w-0 break-words text-[#061A40]">
                          <span className="text-[#6B7280] line-through decoration-[#C2C7D0]">{clip(shownValue(c.field, c.from))}</span>
                          <ArrowRight className="mx-1.5 inline h-3.5 w-3.5 text-[#3D4FE0]" aria-label="to" />
                          <span className="font-medium">{clip(shownValue(c.field, c.to))}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {next && (
        <div className="border-t border-[#EEF0F6] p-3">
          <button
            type="button"
            onClick={() => void more()}
            disabled={loadingMore}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#3D4FE0] transition-colors hover:bg-[#EEF1FF] disabled:opacity-50"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            Show older changes
          </button>
        </div>
      )}
    </section>
  );
}
