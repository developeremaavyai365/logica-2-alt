import { useState, type FormEvent } from 'react';
import { BadgeCheck, Check, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../auth-store';
import { ACCOUNT_SAVE, AccountCard, AccountInput } from './AccountShell';

/* The same rules the backend enforces. */
const RULES = [
  { label: '10+ characters', test: (p: string) => p.length >= 10 },
  { label: 'A capital letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A small letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'A number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'A symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/** Change the password while signed in. Every other device is signed out
 *  afterwards; this one stays signed in. */
export default function ChangePasswordCard() {
  const { changePassword } = useAuthStore();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');

  const passed = RULES.filter((r) => r.test(next)).length;
  const strong = passed === RULES.length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!strong) return setError('The new password does not meet all the rules.');
    if (next !== confirm) return setError('The two new passwords do not match.');
    setStatus('saving');
    const result = await changePassword(current, next);
    if (!result.ok) {
      setStatus('idle');
      setError(result.error ?? 'Could not change your password.');
      return;
    }
    setCurrent('');
    setNext('');
    setConfirm('');
    setStatus('saved');
  }

  const edit = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.target.value);
    setStatus('idle');
  };

  return (
    <AccountCard title="Change password" icon={KeyRound}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AccountInput label="Current password" type="password" autoComplete="current-password" value={current} onChange={edit(setCurrent)} required />
          <AccountInput label="New password" type="password" autoComplete="new-password" value={next} onChange={edit(setNext)} required />
          <AccountInput label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={edit(setConfirm)} required />
        </div>

        {/* Strength: a five-part bar and the rules, filling in as you type */}
        <div className="mt-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {RULES.map((r, i) => (
              <span
                key={r.label}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i < passed ? (strong ? 'bg-emerald-500' : 'bg-[#3D4FE0]') : 'bg-[#EEF0F6]'
                }`}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Password rules">
            {RULES.map((r) => {
              const ok = r.test(next);
              return (
                <li
                  key={r.label}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    ok ? 'bg-[#F1F3FE] text-[#3D4FE0]' : 'bg-[#F5F8FC] text-[#6B7280]'
                  }`}
                >
                  <Check className={`h-3 w-3 ${ok ? '' : 'opacity-30'}`} />
                  {r.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={status === 'saving' || !current || !next || !confirm} className={ACCOUNT_SAVE}>
            {status === 'saving' ? 'Changing…' : 'Change password'}
          </button>
          <p className="text-sm" role="status">
            {error ? (
              <span className="font-medium text-red-600">{error}</span>
            ) : status === 'saved' ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <BadgeCheck className="h-4 w-4" /> Password changed. Your other devices have been signed out.
              </span>
            ) : (
              <span className="text-[#6B7280]">Changing it signs you out on your other devices.</span>
            )}
          </p>
        </div>
      </form>
    </AccountCard>
  );
}
