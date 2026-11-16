import { Laptop, Mail, ShieldCheck } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import AccountShell, { AccountCard } from '../components/account/AccountShell';
import ChangePasswordCard from '../components/account/ChangePasswordCard';
import { useAuthStore } from '../auth-store';

function SecurityPage() {
  const { user } = useAuthStore();
  if (!user) return null;
  return (
    <AccountShell active="security" eyebrow="Account settings" title="Login & security">
      <div className="flex flex-col gap-5">
        <AccountCard title="How you sign in" icon={ShieldCheck}>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li className="flex items-center gap-3.5 rounded-2xl bg-[#F5F8FC] px-4 py-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3D4FE0] shadow-sm">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-[#6B7280]">Email</span>
                <span className="block truncate text-sm font-semibold text-[#061A40]">{user.email}</span>
              </span>
            </li>
            <li className="flex items-center gap-3.5 rounded-2xl bg-[#F5F8FC] px-4 py-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3D4FE0] shadow-sm">
                <Laptop className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-[#6B7280]">This device</span>
                <span className="block text-sm font-semibold text-[#061A40]">Signed in now</span>
              </span>
            </li>
          </ul>
        </AccountCard>
        <ChangePasswordCard />
      </div>
    </AccountShell>
  );
}

export default function Security() {
  return (
    <ProtectedRoute>
      <SecurityPage />
    </ProtectedRoute>
  );
}
