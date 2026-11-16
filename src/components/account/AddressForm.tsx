import { useState, type FormEvent } from 'react';
import { Briefcase, Home, MapPin } from 'lucide-react';
import TextField from '../form/fields/TextField';
import Select from '../form/fields/Select';
import { ADDRESS_LABELS, INDIAN_STATES } from '../../lib/indian-states';
import { addressErrors, cleanPhone, type AddressInput } from '../../lib/addresses';

const ACCENT = '#3D4FE0';
const STATE_OPTIONS = [{ value: '', label: 'Choose a state' }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))];
const LABEL_ICONS = { Home, Work: Briefcase, Other: MapPin } as const;

/** Add or edit a delivery address. Checks every field as the backend will
 *  before sending, and shows the backend's own message if it still says no. */
export default function AddressForm({
  initial,
  heading,
  onSave,
  onCancel,
  /** Hides the "make default" box, for an address that already is. */
  isDefault,
}: {
  initial: AddressInput;
  heading: string;
  onSave: (address: AddressInput) => Promise<string | null>;
  onCancel?: () => void;
  isDefault?: boolean;
}) {
  const [form, setForm] = useState<AddressInput>(initial);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = addressErrors(form);
  const shown = touched ? errors : {};
  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setServerError('');
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    const problem = await onSave({ ...form, phone: cleanPhone(form.phone), postalCode: form.postalCode.trim() });
    setSaving(false);
    if (problem) setServerError(problem);
  }

  const fieldError = (key: keyof AddressInput) =>
    shown[key] ? <p className="mt-1.5 text-xs font-medium text-red-600">{shown[key]}</p> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-shop-accent/40 bg-white shadow-[0_0_0_4px_rgba(61,79,224,0.06)]">
      <div className="border-b border-shop-line px-5 py-2.5">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-accent">{heading}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
        <div>
          <TextField
            label="Full name"
            id="addr-name"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            accent={ACCENT}
          />
          {fieldError('fullName')}
        </div>
        <div>
          <TextField
            label="Mobile number"
            id="addr-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            accent={ACCENT}
          />
          {fieldError('phone')}
        </div>
        <div>
          <TextField
            label="PIN code"
            id="addr-pin"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={form.postalCode}
            onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, ''))}
            accent={ACCENT}
          />
          {fieldError('postalCode')}
        </div>
        <div>
          <TextField
            label="City / town"
            id="addr-city"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            accent={ACCENT}
          />
          {fieldError('city')}
        </div>
        <div className="sm:col-span-2">
          <TextField
            label="Flat, house no., building"
            id="addr-line1"
            autoComplete="address-line1"
            value={form.line1}
            onChange={(e) => set('line1', e.target.value)}
            accent={ACCENT}
          />
          {fieldError('line1')}
        </div>
        <TextField
          label="Area, street, sector (optional)"
          id="addr-line2"
          autoComplete="address-line2"
          value={form.line2}
          onChange={(e) => set('line2', e.target.value)}
          accent={ACCENT}
        />
        <TextField
          label="Landmark (optional)"
          id="addr-landmark"
          placeholder="e.g. Near Apollo Hospital"
          value={form.landmark}
          onChange={(e) => set('landmark', e.target.value)}
          accent={ACCENT}
        />
        <div>
          <Select label="State" value={form.state} onChange={(v) => set('state', v)} options={STATE_OPTIONS} accent={ACCENT} />
          {fieldError('state')}
        </div>
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">Address type</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Address type">
            {ADDRESS_LABELS.map((l) => {
              const Icon = LABEL_ICONS[l];
              const on = form.label === l;
              return (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set('label', l)}
                  className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    on ? 'border-shop-accent bg-[#E8EBFD] text-shop-accent' : 'border-black/10 text-shop-ink/70 hover:border-black/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!isDefault && (
        <label className="mx-5 mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-shop-ink/75">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set('isDefault', e.target.checked)}
            className="h-4 w-4 accent-[#3D4FE0]"
          />
          Make this my default delivery address
        </label>
      )}

      <div className="flex flex-col gap-3 border-t border-shop-line p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-[1rem] px-2 text-xs font-medium text-red-600" role="alert">
          {serverError || (touched && Object.keys(errors).length > 0 ? 'Please fix the highlighted fields.' : '')}
        </p>
        <div className="flex shrink-0 gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-12 rounded-xl border border-shop-line px-6 text-sm font-semibold text-shop-ink/70 transition-colors hover:bg-shop-canvas hover:text-shop-ink"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="h-12 rounded-xl bg-shop-ink px-8 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save address'}
          </button>
        </div>
      </div>
    </form>
  );
}
