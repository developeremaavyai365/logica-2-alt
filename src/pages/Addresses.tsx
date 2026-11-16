import { useEffect, useState } from 'react';
import { MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import AccountShell from '../components/account/AccountShell';
import AddressForm from '../components/account/AddressForm';
import { messageFrom } from '../auth-store';
import {
  EMPTY_ADDRESS,
  addressLine,
  createAddress,
  listAddresses,
  makeDefaultAddress,
  removeAddress,
  updateAddress,
  type AddressInput,
  type SavedAddress,
} from '../lib/addresses';

const toInput = (a: SavedAddress): AddressInput => ({
  fullName: a.fullName,
  phone: a.phone,
  postalCode: a.postalCode,
  line1: a.line1,
  line2: a.line2 ?? '',
  landmark: a.landmark ?? '',
  city: a.city,
  state: a.state,
  label: a.label,
  isDefault: a.isDefault,
});

function AddressBook() {
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [loadError, setLoadError] = useState('');
  /** 'new', an address id being edited, or nothing. */
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    listAddresses()
      .then((list) => {
        setAddresses(list);
        // Nothing saved yet: open the form straight away.
        if (list.length === 0) setEditing('new');
      })
      .catch(() => setLoadError('Could not load your addresses right now. Please try again.'));
  }, []);

  const refresh = () => listAddresses().then(setAddresses).catch(() => {});

  async function save(input: AddressInput, id?: string): Promise<string | null> {
    try {
      if (id) await updateAddress(id, input);
      else await createAddress(input);
      await refresh();
      setEditing(null);
      return null;
    } catch (err) {
      return messageFrom(err, 'Could not save this address.');
    }
  }

  async function run(id: string, action: () => Promise<SavedAddress[]>) {
    setBusy(id);
    setActionError('');
    try {
      setAddresses(await action());
      setConfirmRemove(null);
    } catch (err) {
      setActionError(messageFrom(err, 'That did not work. Please try again.'));
    } finally {
      setBusy(null);
    }
  }

  const addButton = addresses !== null && editing !== 'new' && (
    <button
      type="button"
      onClick={() => setEditing('new')}
      className="flex h-11 items-center gap-2 rounded-xl bg-[#061A40] px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
    >
      <Plus className="h-4 w-4" />
      Add a new address
    </button>
  );

  return (
    <AccountShell active="addresses" eyebrow="Account settings" title="Manage addresses" action={addButton}>
      {loadError && (
        <div className="rounded-2xl border border-red-200 bg-white px-5 py-4 text-sm font-medium text-red-600">{loadError}</div>
      )}

      {!loadError && addresses === null && (
        <div className="h-40 animate-pulse rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)]" aria-busy="true" aria-label="Loading your addresses" />
      )}

      {editing === 'new' && (
        <div className="mb-4">
          <AddressForm
            heading="Add a new address"
            initial={EMPTY_ADDRESS}
            onSave={(input) => save(input)}
            onCancel={addresses && addresses.length > 0 ? () => setEditing(null) : undefined}
          />
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-600">{actionError}</div>
      )}

      {addresses !== null && addresses.length > 0 && (
        <ul className="flex flex-col gap-4">
          {addresses.map((a) =>
            editing === a.id ? (
              <li key={a.id}>
                <AddressForm
                  heading="Edit address"
                  initial={toInput(a)}
                  isDefault={a.isDefault}
                  onSave={(input) => save(input, a.id)}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li key={a.id} className="overflow-hidden rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)]">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF0F6] px-5 py-2.5">
                  <span className="rounded-md bg-shop-canvas px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-shop-ink/60">
                    {a.label}
                  </span>
                  {a.isDefault && (
                    <span className="rounded-md bg-[#E8EBFD] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-shop-accent">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex gap-3.5 px-5 py-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shop-canvas text-shop-ink/60">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-shop-ink">{a.fullName}</p>
                    <p className="mt-1 text-sm leading-relaxed text-shop-ink/70">{addressLine(a)}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-shop-ink/70">
                      <Phone className="h-3.5 w-3.5" />
                      {a.phone}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 border-t border-[#EEF0F6] px-3 py-2">
                  {confirmRemove === a.id ? (
                    <>
                      <span className="px-2 text-sm text-shop-ink/70">Remove this address?</span>
                      <button
                        type="button"
                        disabled={busy === a.id}
                        onClick={() => run(a.id, () => removeAddress(a.id))}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {busy === a.id ? 'Removing…' : 'Yes, remove'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(null)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-shop-ink/60 transition-colors hover:bg-shop-canvas"
                      >
                        Keep it
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(a.id);
                          setConfirmRemove(null);
                        }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-shop-ink/70 transition-colors hover:bg-shop-canvas hover:text-shop-ink"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(a.id)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-shop-ink/70 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                      {!a.isDefault && (
                        <button
                          type="button"
                          disabled={busy === a.id}
                          onClick={() => run(a.id, () => makeDefaultAddress(a.id))}
                          className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold text-shop-accent transition-colors hover:bg-[#E8EBFD] disabled:opacity-50"
                        >
                          {busy === a.id ? 'Saving…' : 'Set as default'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </AccountShell>
  );
}

export default function Addresses() {
  return (
    <ProtectedRoute>
      <AddressBook />
    </ProtectedRoute>
  );
}
