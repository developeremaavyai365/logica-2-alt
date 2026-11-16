import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, FlaskConical, XCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { messageFrom } from '../auth-store';
import { getOrder, rupees, testPayment, type OrderView } from '../lib/checkout';

/** Stands in for the payment company's page until Logica has one. Only
 *  works while the backend runs in test mode; no money moves. */
function TestPaymentPage() {
  const { orderNumber = '' } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'success' | 'failure' | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getOrder(orderNumber)
      .then((o) => {
        if (o.status !== 'PAYMENT_PENDING') navigate(`/orders/${o.orderNumber}`, { replace: true });
        else setOrder(o);
      })
      .catch((err) => setError(messageFrom(err, 'Could not find this order.')));
  }, [orderNumber, navigate]);

  async function pay(outcome: 'success' | 'failure') {
    setBusy(outcome);
    setError('');
    try {
      const o = await testPayment(orderNumber, outcome);
      if (outcome === 'success') {
        navigate(`/orders/${o.orderNumber}?placed=1`, { replace: true });
        return;
      }
      setFailed(true);
      setOrder(o);
    } catch (err) {
      setError(messageFrom(err, 'The payment did not go through.'));
    } finally {
      setBusy(null);
    }
  }

  const payBy = order?.payBy ? new Date(order.payBy).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>
      <section className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-shop-line bg-white shadow-[0_24px_50px_-28px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 bg-amber-50 px-5 py-2.5 text-xs font-semibold text-amber-800">
            <FlaskConical className="h-4 w-4" />
            Test mode: no real money is taken
          </div>

          <div className="px-6 py-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8EBFD] text-shop-accent">
              <CreditCard className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm text-shop-ink/60">Amount to pay</p>
            <p className="font-dm-sans text-4xl font-bold tabular-nums text-shop-ink" style={{ letterSpacing: '-0.03em' }}>
              {order ? rupees(order.totalPaise) : '—'}
            </p>
            <p className="mt-1 font-mono text-xs text-shop-ink/50">Order {orderNumber}</p>
            {payBy && <p className="mt-3 text-xs text-shop-ink/60">Please pay by {payBy}, or the order is cancelled.</p>}
          </div>

          {failed && (
            <p className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <XCircle className="h-4 w-4 shrink-0" />
              Payment failed. You can try again.
            </p>
          )}
          {error && <p className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex flex-col gap-2 border-t border-shop-line p-4">
            <button
              type="button"
              disabled={!order || busy !== null}
              onClick={() => pay('success')}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors hover:bg-shop-accent disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy === 'success' ? 'Paying…' : `Pay ${order ? rupees(order.totalPaise) : ''}`}
            </button>
            <button
              type="button"
              disabled={!order || busy !== null}
              onClick={() => pay('failure')}
              className="h-11 rounded-xl border border-shop-line text-sm font-semibold text-shop-ink/70 transition-colors hover:bg-shop-canvas disabled:opacity-40"
            >
              {busy === 'failure' ? 'Failing…' : 'Simulate a failed payment'}
            </button>
            <Link to="/orders" className="mt-1 text-center text-xs font-semibold text-shop-ink/50 hover:text-shop-ink">
              Pay later from My orders
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default function TestPayment() {
  return (
    <ProtectedRoute>
      <TestPaymentPage />
    </ProtectedRoute>
  );
}
