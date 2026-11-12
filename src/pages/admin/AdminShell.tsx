import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, Lock, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../auth-store';
import { AUTH_SUBMIT, IconField } from '../../components/auth/fields';

/* The admin panel's frame: its own header and its own sign-in, apart from
   the shop. Only an administrator account gets past the sign-in — the
   backend's /auth/admin/login refuses every other account — and the shop's
   sign-in refuses the administrator, so the two never share credentials. */

const NAVY = '#061A40';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/sap-import', label: 'SAP product import', end: false },
];

function AdminLogin() {
  const { user, adminSignIn, forgotPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await adminSignIn(email.trim(), password);
    setBusy(false);
    if (!result.ok) setError(result.error ?? 'Invalid email or password.');
  }

  async function sendReset(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await forgotPassword(email.trim());
    setBusy(false);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: NAVY }}>
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-dm-sans text-[28px] font-bold" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Logica Admin
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">Sign in with the administrator account.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_-12px_rgba(6,26,64,0.15)]">
          {forgot ? (
            sent ? (
              <div className="px-6 py-8 text-center">
                <Mail className="mx-auto h-8 w-8 text-[#3D4FE0]" />
                <p className="mt-3 text-sm leading-relaxed text-[#374151]">
                  If <span className="font-semibold">{email}</span> is the administrator account, a link to set a new password has
                  been sent to it. It is valid for 30 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgot(false);
                    setSent(false);
                  }}
                  className="mt-5 text-sm font-semibold text-[#061A40] hover:text-[#3D4FE0]"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={sendReset} className="px-6 py-7">
                <p className="font-dm-sans text-lg font-bold" style={{ color: NAVY }}>
                  Set or reset the password
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">Enter the administrator email and we'll send a link.</p>
                <div className="mt-5">
                  <IconField icon={<Mail className="h-4 w-4" />} type="email" value={email} onChange={setEmail} placeholder="Admin email" required autoComplete="username" />
                </div>
                <button type="submit" disabled={busy} className={`mt-5 ${AUTH_SUBMIT}`}>
                  {busy ? 'Sending…' : 'Send link'}
                </button>
                <button type="button" onClick={() => setForgot(false)} className="mx-auto mt-4 flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#061A40]">
                  <ArrowLeft className="h-4 w-4" /> Back to sign in
                </button>
              </form>
            )
          ) : (
            <form onSubmit={submit} className="px-6 py-7">
              {user && user.role !== 'ADMIN' && (
                <p className="mb-4 rounded-xl bg-[#F5F8FC] px-3.5 py-2.5 text-xs leading-relaxed text-[#6B7280]">
                  You're signed in to the shop as {user.email}. The admin panel uses a separate administrator account.
                </p>
              )}
              <div className="space-y-3">
                <IconField icon={<Mail className="h-4 w-4" />} type="email" value={email} onChange={setEmail} placeholder="Admin email" required autoComplete="username" />
                <IconField icon={<Lock className="h-4 w-4" />} type="password" value={password} onChange={setPassword} placeholder="Password" required autoComplete="current-password" />
              </div>
              {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => setForgot(true)} className="text-xs font-medium text-[#6B7280] hover:text-[#3D4FE0]">
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={busy} className={`mt-4 ${AUTH_SUBMIT}`}>
                {busy ? 'Signing in…' : 'Sign in'}
                {!busy && <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />}
              </button>
            </form>
          )}
        </div>

        <Link to="/" className="mx-auto mt-5 flex w-fit items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#061A40]">
          <ArrowLeft className="h-4 w-4" /> Back to the website
        </Link>
      </div>
    </div>
  );
}

/** Wraps every admin page: the sign-in until an administrator is signed in,
 *  then the admin header over the page. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, ready, signOut } = useAuthStore();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F8FC]">
        <Loader2 className="h-6 w-6 animate-spin text-[#6B7280]" />
      </div>
    );
  }
  if (user?.role !== 'ADMIN') return <AdminLogin />;

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      <header style={{ backgroundColor: NAVY }} className="text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-dm-sans text-base font-bold">Logica Admin</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-white text-[#061A40]' : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-white/60 md:inline">{user.email}</span>
            <Link to="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white/75 hover:bg-white/10 hover:text-white">
              <ExternalLink className="h-4 w-4" /> Website
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white/75 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
