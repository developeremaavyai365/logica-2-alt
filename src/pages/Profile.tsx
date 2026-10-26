import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '../auth-store';
import TextField from '../components/form/fields/TextField';
import Select from '../components/form/fields/Select';
import DateField from '../components/form/fields/DateField';
import AccountHeaderCard from '../components/account/AccountHeaderCard';

const ACCENT = '#3D4FE0';

const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const TODAY_ISO = new Date().toISOString().slice(0, 10);

function ProfileForm() {
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError('');
    const result = await updateProfile({
      name,
      phone,
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth).toISOString() }),
      ...(gender && { gender }),
    });
    if (!result.ok) {
      setStatus('error');
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  }

  if (!user) return null;

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <AccountHeaderCard active="profile" />

        {/* Personal details card. No overflow-hidden here: the date picker
            and the gender menu open as popovers from inside it and would be
            clipped at the card's edge. */}
        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-shop-line bg-white">
          {/* Module — header strip */}
          <div className="flex items-center justify-between gap-3 border-b border-shop-line px-5 py-2.5">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink">Personal details</h2>
            <span className="font-mono text-[11px] tabular-nums text-shop-ink/45">04 fields</span>
          </div>

          {/* Module — fields */}
          <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
            <TextField
              label="Full name"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              accent={ACCENT}
            />
            <TextField
              label="Phone number"
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              accent={ACCENT}
            />
            <DateField
              label="Date of birth"
              id="dob"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              max={TODAY_ISO}
              accent={ACCENT}
            />
            <Select label="Gender" value={gender} onChange={setGender} options={GENDER_OPTIONS} accent={ACCENT} />
          </div>

          {/* Module — email on file */}
          <div className="flex items-center gap-3.5 border-t border-shop-line px-5 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-shop-canvas text-shop-ink">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45">Email</span>
              <span className="block truncate text-sm font-medium text-shop-ink">{user.email || 'No email on file'}</span>
            </div>
            {user.emailVerified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E8EBFD] px-2.5 py-1 text-[11px] font-semibold text-shop-accent">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>

          {/* Module — save row */}
          <div className="flex flex-col gap-3 border-t border-shop-line p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-[1rem] px-2 text-xs font-medium text-red-600">{error}</p>
            <button
              type="submit"
              disabled={status === 'saving'}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-shop-ink px-8 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save changes'}
              {status === 'saved' && <CheckCircle2 className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileForm />
    </ProtectedRoute>
  );
}
