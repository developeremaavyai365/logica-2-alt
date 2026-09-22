import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiFetch } from '../lib/api-client';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPricePaise: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STYLE: Record<string, string> = {
  DELIVERED: 'bg-[#DFF5E3] text-[#15803D]',
  CANCELLED: 'bg-red-50 text-red-600',
  RETURNED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-red-50 text-red-600',
};

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function OrdersList() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch<Order[]>('/orders')
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your orders right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full bg-[#ECEDEC]">
      <Header />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 md:px-10">
        <h1 className="font-dm-sans text-2xl font-bold text-black sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>
          Your Orders
        </h1>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!error && orders === null && <p className="mt-6 text-sm text-[#6b6b6b]">Loading…</p>}

        {orders !== null && orders.length === 0 && (
          <div className="mt-8 flex flex-col items-center rounded-3xl bg-white p-12 text-center shadow-sm">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ECEDEC] text-black">
              <Package className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-black">No orders yet</h2>
            <p className="mt-2 max-w-sm text-sm text-[#6b6b6b]">
              Once you place an order, it'll show up here with its status and delivery details.
            </p>
            <Link
              to="/shop"
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {orders !== null && orders.length > 0 && (
          <div className="mt-8 space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECEDEC] text-black">
                  <Package className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-black">#{order.orderNumber}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        STATUS_STYLE[order.status] ?? 'bg-[#ECEDEC] text-[#6b6b6b]'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6b6b6b]">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-black">{formatRupees(order.totalPaise)}</p>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#6b6b6b]" />
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function Orders() {
  return (
    <ProtectedRoute>
      <OrdersList />
    </ProtectedRoute>
  );
}
