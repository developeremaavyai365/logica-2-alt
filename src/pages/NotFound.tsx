import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <p className="font-dm-sans text-6xl font-bold text-black">404</p>
        <h1 className="font-dm-sans mt-3 text-2xl font-medium text-black">Page not found</h1>
        <p className="font-inter mt-2 max-w-sm text-sm text-black/50">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          to="/"
          className="btn-liquid font-inter mt-8 flex h-12 items-center gap-2 rounded-md border-2 border-[#000000] px-6 text-sm font-medium text-[#000000] transition-colors"
        >
          Back to Home
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
      <Footer />
    </div>
  );
}
