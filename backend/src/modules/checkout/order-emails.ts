/* The order emails: the alert the warehouse gets for each new order, and
   the updates the customer gets as it moves. Every value from the order is
   escaped, as names and addresses are typed by customers. */

export interface EmailOrder {
  orderNumber: string;
  createdAt: Date;
  paymentMethod: 'COD' | 'ONLINE';
  totalPaise: number;
  shippingPaise: number;
  items: { name: string; sapCode: string; quantity: number; unitPricePaise: number }[];
  address: { fullName: string; phone: string; line1: string; line2: string | null; landmark: string | null; city: string; state: string; postalCode: string };
  customer: { name: string; email: string };
  courierName?: string | null;
  trackingNumber?: string | null;
}

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const when = (date: Date) =>
  date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function frame(inner: string): string {
  return `<div style="font-family:-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:28px 22px;color:#111;">${inner}<p style="margin-top:28px;font-size:12px;color:#999;">Logica Infoway</p></div>`;
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;margin-top:18px;padding:12px 22px;background:#000;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;">${esc(label)}</a>`;
}

function itemsTable(order: EmailOrder, withCodes: boolean): string {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;">${i.quantity} × ${esc(i.name)}${
          withCodes ? `<br><span style="color:#888;font-size:12px;">Item code ${esc(i.sapCode)}</span>` : ''
        }</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;white-space:nowrap;">${rupees(i.unitPricePaise * i.quantity)}</td>
      </tr>`,
    )
    .join('');
  const shipping = order.shippingPaise
    ? `<tr><td style="padding:8px 0;font-size:14px;color:#555;">Delivery</td><td style="padding:8px 0;text-align:right;font-size:14px;">${rupees(order.shippingPaise)}</td></tr>`
    : '';
  return `<table style="width:100%;border-collapse:collapse;margin-top:14px;">${rows}${shipping}
    <tr><td style="padding:10px 0;font-size:15px;font-weight:700;">Total</td><td style="padding:10px 0;text-align:right;font-size:15px;font-weight:700;">${rupees(order.totalPaise)}</td></tr>
  </table>`;
}

function addressBlock(order: EmailOrder): string {
  const a = order.address;
  const lines = [a.fullName, a.line1, a.line2, a.landmark ? `Near ${a.landmark}` : null, `${a.city}, ${a.state} ${a.postalCode}`, `Phone ${a.phone}`]
    .filter(Boolean)
    .map((l) => esc(l as string));
  return `<p style="font-size:14px;line-height:1.6;margin:6px 0 0;">${lines.join('<br>')}</p>`;
}

const paymentWords = (order: EmailOrder) => (order.paymentMethod === 'COD' ? `Cash on delivery: collect ${rupees(order.totalPaise)}` : 'Paid online');

/** The warehouse's alert for a new order. */
export function warehouseAlert(order: EmailOrder, adminUrl: string): { subject: string; html: string } {
  return {
    subject: `New order ${order.orderNumber} · ${rupees(order.totalPaise)} · ${order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}`,
    html: frame(`
      <h1 style="font-size:20px;margin:0;">New order ${esc(order.orderNumber)}</h1>
      <p style="font-size:14px;color:#555;margin:6px 0 0;">${esc(when(order.createdAt))} · ${esc(paymentWords(order))}</p>
      ${itemsTable(order, true)}
      <h2 style="font-size:15px;margin:22px 0 0;">Deliver to</h2>
      ${addressBlock(order)}
      <p style="font-size:13px;color:#555;margin:14px 0 0;">Customer: ${esc(order.customer.name)} · ${esc(order.customer.email)}</p>
      ${button(adminUrl, 'Open the order')}
    `),
  };
}

/** An update for the customer. */
export function customerUpdate(
  order: EmailOrder,
  message: { subject: string; heading: string; body: string },
  orderUrl: string,
): { subject: string; html: string } {
  return {
    subject: `${message.subject} · ${order.orderNumber}`,
    html: frame(`
      <h1 style="font-size:20px;margin:0;">${esc(message.heading)}</h1>
      <p style="font-size:14px;color:#555;line-height:1.6;margin:8px 0 0;">${esc(message.body)}</p>
      <p style="font-size:13px;color:#888;margin:16px 0 0;">Order ${esc(order.orderNumber)} · ${esc(when(order.createdAt))}</p>
      ${itemsTable(order, false)}
      <h2 style="font-size:15px;margin:20px 0 0;">Delivering to</h2>
      ${addressBlock(order)}
      ${button(orderUrl, 'View your order')}
    `),
  };
}
