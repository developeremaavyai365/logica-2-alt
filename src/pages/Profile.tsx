import { useState, type FormEvent } from 'react';
import { BadgeCheck, ChevronDown, Mail, Phone, ShieldQuestion, UserRound } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore, type AuthUser } from '../auth-store';
import DateField from '../components/form/fields/DateField';
import AccountShell, { ACCOUNT_SAVE, AccountCard, AccountInput, EditToggle } from '../components/account/AccountShell';

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

/** "Asha Rani Verma" → ["Asha", "Rani Verma"]. */
const splitName = (name: string | null) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return [parts[0] ?? '', parts.slice(1).join(' ')];
};

/** A stored phone shown as ten digits, without "+91". */
const tenDigits = (phone: string | null) => (phone ?? '').replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');

function SaveRow({ saving, error, label = 'Save' }: { saving: boolean; error: string; label?: string }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-4">
      <button type="submit" disabled={saving} className={ACCOUNT_SAVE}>
        {saving ? 'Saving…' : label}
      </button>
      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Saved({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <BadgeCheck className="h-3.5 w-3.5" /> Saved
    </span>
  );
}

/** Name, gender and date of birth. */
function PersonalInformation({ user }: { user: AuthUser }) {
  const { updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [storedFirst, storedLast] = splitName(user.name);
  const storedDob = user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '';

  function startEditing() {
    setFirst(storedFirst);
    setLast(storedLast);
    setGender(user.gender ?? '');
    setDob(storedDob);
    setError('');
    setSaved(false);
    setEditing(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = `${first.trim()} ${last.trim()}`.trim();
    if (!first.trim()) return setError('Please enter your first name.');
    setSaving(true);
    setError('');
    const result = await updateProfile({
      name,
      ...(gender && { gender }),
      ...(dob && { dateOfBirth: dob }),
    });
    setSaving(false);
    if (!result.ok) return setError(result.error ?? 'Could not save your changes.');
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const shownGender = editing ? gender : user.gender ?? '';

  return (
    <AccountCard
      title="Personal information"
      icon={UserRound}
      action={
        <span className="flex items-center gap-2">
          <Saved show={saved} />
          <EditToggle editing={editing} onToggle={() => (editing ? setEditing(false) : startEditing())} />
        </span>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AccountInput
            label="First name"
            autoComplete="given-name"
            value={editing ? first : storedFirst}
            onChange={(e) => setFirst(e.target.value)}
            readOnly={!editing}
            placeholder={editing ? 'First name' : 'Not added'}
          />
          <AccountInput
            label="Last name"
            autoComplete="family-name"
            value={editing ? last : storedLast}
            onChange={(e) => setLast(e.target.value)}
            readOnly={!editing}
            placeholder={editing ? 'Last name' : 'Not added'}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <span className="mb-2 block text-xs font-medium text-[#6B7280]">Your gender</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gender">
              {GENDERS.map((g) => {
                const on = shownGender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!editing}
                    onClick={() => setGender(g.value)}
                    className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all ${
                      on
                        ? 'border-[#3D4FE0] bg-[#F1F3FE] text-[#3D4FE0]'
                        : editing
                          ? 'border-[#E5E7EB] text-[#061A40]/70 hover:border-[#C7D2FE]'
                          : 'border-transparent bg-[#F5F8FC] text-[#061A40]/45'
                    } ${editing ? '' : 'cursor-default'}`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        on ? 'border-[#3D4FE0]' : 'border-[#CBD2E1]'
                      }`}
                    >
                      {on && <span className="h-1.5 w-1.5 rounded-full bg-[#3D4FE0]" />}
                    </span>
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {editing ? (
            <DateField label="Date of birth" id="dob" value={dob} onChange={setDob} max={TODAY_ISO} accent="#3D4FE0" soft />
          ) : (
            <AccountInput
              label="Date of birth"
              readOnly
              value={
                storedDob
                  ? new Date(`${storedDob}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : ''
              }
              placeholder="Not added"
            />
          )}
        </div>

        {editing && <SaveRow saving={saving} error={error} />}
      </form>
    </AccountCard>
  );
}

/** The sign-in email. Not changeable here: it is the account's identity. */
function EmailAddress({ user }: { user: AuthUser }) {
  return (
    <AccountCard
      title="Email address"
      icon={Mail}
      action={
        user.emailVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F3FE] px-3 py-1 text-xs font-semibold text-[#3D4FE0]">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        ) : undefined
      }
    >
      <div className="max-w-md">
        <AccountInput label="Email" readOnly value={user.email ?? ''} placeholder="No email on file" />
      </div>
      <p className="mt-2.5 text-xs text-[#6B7280]">You sign in with this email. To change it, please contact us.</p>
    </AccountCard>
  );
}

function MobileNumber({ user }: { user: AuthUser }) {
  const { updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const stored = tenDigits(user.phone);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const digits = tenDigits(phone);
    if (!/^[6-9]\d{9}$/.test(digits)) return setError('Enter a 10-digit mobile number.');
    setSaving(true);
    setError('');
    const result = await updateProfile({ phone: digits });
    setSaving(false);
    if (!result.ok) return setError(result.error ?? 'Could not save your number.');
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AccountCard
      title="Mobile number"
      icon={Phone}
      action={
        <span className="flex items-center gap-2">
          <Saved show={saved} />
          <EditToggle
            editing={editing}
            onToggle={() => {
              setPhone(stored);
              setError('');
              setSaved(false);
              setEditing((v) => !v);
            }}
          />
        </span>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="max-w-md">
          <AccountInput
            label="Mobile number"
            prefix="+91"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={14}
            value={editing ? phone : stored}
            onChange={(e) => setPhone(e.target.value)}
            readOnly={!editing}
            placeholder={editing ? '10-digit mobile number' : 'Not added'}
          />
        </div>
        {editing ? (
          <SaveRow saving={saving} error={error} />
        ) : (
          <p className="mt-2.5 text-xs text-[#6B7280]">We call this number only about your orders and deliveries.</p>
        )}
      </form>
    </AccountCard>
  );
}

const FAQS = [
  {
    q: 'What happens when I update my mobile number?',
    a: 'We use the new number for calls and messages about your orders and deliveries. Orders you have already placed keep the phone number of the delivery address chosen at checkout.',
  },
  {
    q: 'Can I change the email I sign in with?',
    a: 'Your email is how you sign in, so it cannot be changed from this page. Write to info@logicainfoway.com from your current email and our team will help.',
  },
  {
    q: 'Will editing my details affect my past orders?',
    a: 'No. Every order keeps a copy of the name, address and phone number it was placed with, so changes here only apply to new orders.',
  },
  {
    q: 'How do I change my password?',
    a: 'Open Login & security from the menu. Changing your password signs you out on all your other devices.',
  },
];

function Faqs() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <AccountCard title="FAQs" icon={ShieldQuestion}>
      <ul className="divide-y divide-[#EEF0F6] rounded-2xl border border-[#EEF0F6]">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#061A40] transition-colors hover:bg-[#F8F9FD]"
              >
                {f.q}
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#3D4FE0] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <p className="overflow-hidden px-5 text-sm leading-relaxed text-[#6B7280]">
                  <span className="block pb-4">{f.a}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </AccountCard>
  );
}

function ProfilePage() {
  const { user } = useAuthStore();
  if (!user) return null;
  return (
    <AccountShell active="profile" eyebrow="Account settings" title="Profile information">
      <div className="flex flex-col gap-5">
        <PersonalInformation user={user} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <EmailAddress user={user} />
          <MobileNumber user={user} />
        </div>
        <Faqs />
        <p className="px-1 text-sm text-[#6B7280]">
          Want your account deleted?{' '}
          <a
            href="mailto:info@logicainfoway.com?subject=Please%20delete%20my%20account"
            className="font-semibold text-red-600 hover:underline"
          >
            Request account deletion
          </a>
        </p>
      </div>
    </AccountShell>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
