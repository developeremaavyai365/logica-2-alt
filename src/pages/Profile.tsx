import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '../auth-store';
import TextField from '../components/form/fields/TextField';
import Select from '../components/form/fields/Select';
import DateField from '../components/form/fields/DateField';

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
    <div className="w-full bg-[#ECEDEC]">
      <Header />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 md:px-10">
        <div className="flex items-center gap-4">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #15803D 0%, #000000 100%)' }}
          >
            {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="font-dm-sans text-2xl font-bold text-black sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>
              {user.name || 'My Profile'}
            </h1>
            <p className="text-sm text-[#6b6b6b]">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6b6b6b]">Personal details</h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Full name" type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField
              label="Phone number"
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
            <DateField label="Date of birth" id="dob" value={dateOfBirth} onChange={setDateOfBirth} max={TODAY_ISO} />
            <Select
              label="Gender"
              value={gender}
              onChange={setGender}
              options={GENDER_OPTIONS}
            />
          </div>

          <div className="mt-6 space-y-3 border-t border-black/10 pt-6">
            <div className="flex items-center gap-3 text-sm text-[#6b6b6b]">
              <Mail className="h-4 w-4 shrink-0" />
              {user.email || 'No email on file'}
              {user.emailVerified && (
                <span className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-[#15803D]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
          </div>

          {error && <p className="mt-4 text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={status === 'saving'}
            className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-black px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save changes'}
            {status === 'saved' && <CheckCircle2 className="h-4 w-4" />}
          </button>
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
