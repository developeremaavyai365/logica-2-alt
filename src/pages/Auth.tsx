import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthPanel from '../components/auth/AuthPanel';

export default function Auth({ mode }: { mode: 'signin' | 'signup' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>
      <section className="flex justify-center px-4 py-14 sm:px-6 sm:py-20 md:px-10">
        <AuthPanel initialMode={mode} onSuccess={() => navigate(redirect, { replace: true })} />
      </section>
      <Footer />
    </div>
  );
}
