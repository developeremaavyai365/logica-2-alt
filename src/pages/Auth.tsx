import { useSearchParams, useNavigate } from 'react-router-dom';
import { Award, ShieldCheck, MapPin } from 'lucide-react';
import AuthPanel from '../components/auth/AuthPanel';
import AuthShell, { TitleGlow } from '../components/auth/AuthShell';

const HIGHLIGHTS = [
  { icon: Award, text: '30+ years in business since 1995, trusted by enterprise and government buyers' },
  { icon: ShieldCheck, text: 'Genuine products and authorized brand partnerships, not grey-market stock' },
  { icon: MapPin, text: 'From our Kolkata roots to Delhi, Mumbai, Bengaluru and beyond' },
];

/** Sign in and sign up. */
export default function Auth({ mode }: { mode: 'signin' | 'signup' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <AuthShell
      eyebrow="Your Logica account"
      title={
        <>
          Everything you buy, <TitleGlow>in one place</TitleGlow>
        </>
      }
      text="Manage your orders, save your wishlist, and check out faster next time."
      points={HIGHLIGHTS}
    >
      <AuthPanel initialMode={mode} onSuccess={() => navigate(redirect, { replace: true })} />
    </AuthShell>
  );
}
