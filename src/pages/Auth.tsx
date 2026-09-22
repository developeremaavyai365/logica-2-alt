import { useSearchParams, useNavigate } from 'react-router-dom';
import { Award, ShieldCheck, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthPanel from '../components/auth/AuthPanel';

const HIGHLIGHTS = [
  { icon: Award, text: '30+ years in business, since 1995 — trusted by enterprise and government buyers' },
  { icon: ShieldCheck, text: 'Genuine products and authorized brand partnerships, not grey-market stock' },
  { icon: MapPin, text: 'From our Kolkata roots to Delhi, Mumbai, Bengaluru and beyond' },
];

export default function Auth({ mode }: { mode: 'signin' | 'signup' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <div className="w-full bg-white">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      {/* Split screen, both halves plain white — the welcome side carries
          its identity through the green heading and icon accents instead
          of a background image. */}
      <section className="grid min-h-[calc(100vh-88px)] bg-white lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <h1
              className="font-dm-sans text-4xl font-bold text-[#15803D] sm:text-5xl"
              style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              Welcome to your account
            </h1>
            <p className="font-inter mt-4 text-sm leading-relaxed text-[#6b6b6b] sm:text-base">
              Sign in to manage orders, save your wishlist, and check out faster next time.
            </p>

            <div className="mt-10 space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DFF5E3] text-[#15803D]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-inter text-sm font-medium text-black">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border-t border-black/10 bg-white px-4 py-14 sm:px-8 sm:py-20 lg:border-l lg:border-t-0">
          <img src="/logica-logo-shine.png" alt="Logica Infoway" className="mb-8 h-20 w-auto object-contain sm:h-24" />
          <AuthPanel initialMode={mode} onSuccess={() => navigate(redirect, { replace: true })} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
