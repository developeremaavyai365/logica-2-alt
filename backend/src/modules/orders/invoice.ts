/* The GST on an invoice. Shop prices include GST, so each line's tax is
   taken out of its price: taxable value = price × 100 / (100 + rate). Within
   the seller's own state the tax is split into CGST and SGST; to another
   state it is IGST. Plain TypeScript with no imports, shared with the
   printed invoice. Money is in paise. */

/** The state of each GST state code (the first two digits of a GSTIN). */
export const GST_STATES: Record<string, string> = {
  '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland',
  '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat', '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh',
};

const normalise = (state: string) => state.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '').replace(/^nct(of)?/, '');

/** The state a GSTIN is registered in, or null for a malformed one. */
export function stateOfGstin(gstin: string): string | null {
  return /^\d{2}[A-Z0-9]{13}$/.test(gstin.trim().toUpperCase()) ? GST_STATES[gstin.trim().slice(0, 2)] ?? null : null;
}

/** Whether two state names are the same state ("Delhi" and "NCT of Delhi"). */
export function sameState(a: string, b: string): boolean {
  return normalise(a) === normalise(b);
}

export interface InvoiceItemInput {
  name: string;
  sapCode: string;
  hsnCode: string | null;
  gstRatePercent: number | null;
  quantity: number;
  unitPricePaise: number;
}

export interface InvoiceLine {
  name: string;
  sapCode: string;
  hsnCode: string;
  quantity: number;
  /** Price per unit, GST included. */
  unitPricePaise: number;
  gstRatePercent: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export interface InvoiceTotals {
  lines: InvoiceLine[];
  /** True when the tax is CGST + SGST (delivery within the seller's state). */
  intraState: boolean;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

/** GST when a product has no rate on its listing: the usual rate for
 *  phones, laptops and accessories. */
export const DEFAULT_GST_PERCENT = 18;
/** The service code for delivery charges. */
export const DELIVERY_SAC = '996812';

/** The invoice lines and totals for an order. */
export function invoiceTotals(
  items: InvoiceItemInput[],
  shippingPaise: number,
  seller: { state: string },
  buyer: { state: string },
): InvoiceTotals {
  const intraState = sameState(seller.state, buyer.state);
  const all: InvoiceItemInput[] = [...items];
  if (shippingPaise > 0) {
    all.push({ name: 'Delivery charges', sapCode: '', hsnCode: DELIVERY_SAC, gstRatePercent: DEFAULT_GST_PERCENT, quantity: 1, unitPricePaise: shippingPaise });
  }
  const lines = all.map((item): InvoiceLine => {
    const rate = item.gstRatePercent ?? DEFAULT_GST_PERCENT;
    const totalPaise = item.unitPricePaise * item.quantity;
    const taxablePaise = Math.round((totalPaise * 100) / (100 + rate));
    const tax = totalPaise - taxablePaise;
    const cgstPaise = intraState ? Math.floor(tax / 2) : 0;
    return {
      name: item.name,
      sapCode: item.sapCode,
      hsnCode: item.hsnCode ?? '',
      quantity: item.quantity,
      unitPricePaise: item.unitPricePaise,
      gstRatePercent: rate,
      taxablePaise,
      cgstPaise,
      sgstPaise: intraState ? tax - cgstPaise : 0,
      igstPaise: intraState ? 0 : tax,
      totalPaise,
    };
  });
  const sum = (key: keyof Pick<InvoiceLine, 'taxablePaise' | 'cgstPaise' | 'sgstPaise' | 'igstPaise' | 'totalPaise'>) =>
    lines.reduce((n, l) => n + l[key], 0);
  return {
    lines,
    intraState,
    taxablePaise: sum('taxablePaise'),
    cgstPaise: sum('cgstPaise'),
    sgstPaise: sum('sgstPaise'),
    igstPaise: sum('igstPaise'),
    totalPaise: sum('totalPaise'),
  };
}

/** The financial year a date falls in, in India's April-to-March years:
 *  "2026-27" for 17 Nov 2026. */
export function financialYear(date: Date): string {
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const y = ist.getUTCFullYear();
  const start = ist.getUTCMonth() >= 3 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

/** "LIL/2026-27/00042": the series, the financial year and a running number
 *  that starts again each year, as GST asks. */
export function invoiceNumber(year: string, seq: number): string {
  return `LIL/${year}/${String(seq).padStart(5, '0')}`;
}

/** Rupees in words, for the foot of an invoice: "Sixty Nine Thousand Nine
 *  Hundred Rupees Only". */
export function rupeesInWords(paise: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (n: number) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`);
  const three = (n: number) => `${n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' : ''}` : ''}${n % 100 ? two(n % 100) : ''}`;
  const words = (n: number): string => {
    if (n === 0) return 'Zero';
    const parts: string[] = [];
    const crore = Math.floor(n / 10_000_000);
    const lakh = Math.floor((n % 10_000_000) / 100_000);
    const thousand = Math.floor((n % 100_000) / 1000);
    const rest = n % 1000;
    if (crore) parts.push(`${words(crore)} Crore`);
    if (lakh) parts.push(`${two(lakh)} Lakh`);
    if (thousand) parts.push(`${two(thousand)} Thousand`);
    if (rest) parts.push(three(rest));
    return parts.join(' ');
  };
  const rupees = Math.floor(paise / 100);
  const p = paise % 100;
  return `${words(rupees)} Rupees${p ? ` and ${two(p)} Paise` : ''} Only`;
}
