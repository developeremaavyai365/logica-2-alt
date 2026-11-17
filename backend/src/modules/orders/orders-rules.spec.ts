import { canMove, customerMessage, nextSteps, refundDue } from './order-flow';
import { financialYear, invoiceNumber, invoiceTotals, rupeesInWords, sameState, stateOfGstin } from './invoice';

const cod = { method: 'COD' as const, status: 'PENDING' as const };
const paidOnline = { method: 'ONLINE' as const, status: 'CAPTURED' as const };

describe('order steps', () => {
  it('walks a new order through confirm, pack, ship and deliver', () => {
    expect(nextSteps('PLACED', cod).map((s) => s.to)).toEqual(['CONFIRMED', 'CANCELLED']);
    expect(canMove('CONFIRMED', 'PROCESSING', cod)).toBe(true);
    expect(nextSteps('PROCESSING', cod).find((s) => s.to === 'SHIPPED')?.needsTracking).toBe(true);
    expect(canMove('SHIPPED', 'DELIVERED', cod)).toBe(true);
    expect(canMove('OUT_FOR_DELIVERY', 'DELIVERED', cod)).toBe(true);
  });

  it('does not let an order skip steps or come back from delivered', () => {
    expect(canMove('PLACED', 'SHIPPED', cod)).toBe(false);
    expect(canMove('DELIVERED', 'PLACED', cod)).toBe(false);
    expect(canMove('SHIPPED', 'CANCELLED', cod)).toBe(false);
  });

  it('asks for a refund only when money was taken', () => {
    expect(nextSteps('CANCELLED', paidOnline).map((s) => s.to)).toEqual(['REFUNDED']);
    expect(nextSteps('CANCELLED', cod)).toEqual([]);
    expect(refundDue('RETURNED', paidOnline)).toBe(true);
    expect(refundDue('CANCELLED', cod)).toBe(false);
  });

  it('tells the customer the courier and tracking number when shipped', () => {
    const msg = customerMessage('SHIPPED', { courierName: 'Delhivery', trackingNumber: 'DL123', paymentMethod: 'COD' });
    expect(msg?.body).toContain('Delhivery');
    expect(msg?.body).toContain('DL123');
    expect(customerMessage('PROCESSING', { paymentMethod: 'COD' })).toBeNull();
  });
});

describe('GST invoice', () => {
  const phone = { name: 'Phone', sapCode: '500103', hsnCode: '85171300', gstRatePercent: 18, quantity: 1, unitPricePaise: 11_800_00 };

  it('takes GST out of the price: CGST and SGST within the state, IGST outside', () => {
    const within = invoiceTotals([phone], 0, { state: 'Delhi' }, { state: 'NCT of Delhi' });
    expect(within.intraState).toBe(true);
    expect(within.taxablePaise).toBe(10_000_00);
    expect(within.cgstPaise + within.sgstPaise).toBe(1_800_00);
    expect(within.igstPaise).toBe(0);

    const outside = invoiceTotals([phone], 0, { state: 'West Bengal' }, { state: 'Delhi' });
    expect(outside.intraState).toBe(false);
    expect(outside.igstPaise).toBe(1_800_00);
    expect(outside.totalPaise).toBe(11_800_00);
  });

  it('adds delivery as a line and uses 18% where a product has no rate', () => {
    const t = invoiceTotals([{ ...phone, gstRatePercent: null, hsnCode: null }], 100_00, { state: 'Delhi' }, { state: 'Haryana' });
    expect(t.lines).toHaveLength(2);
    expect(t.lines[0].gstRatePercent).toBe(18);
    expect(t.lines[1].name).toBe('Delivery charges');
    expect(t.totalPaise).toBe(11_900_00);
    // Every paisa is accounted for: taxable value plus tax is the total.
    expect(t.taxablePaise + t.igstPaise + t.cgstPaise + t.sgstPaise).toBe(t.totalPaise);
  });

  it('reads the state from a GSTIN and matches state names loosely', () => {
    expect(stateOfGstin('19AABCE0772B1Z1')).toBe('West Bengal');
    expect(stateOfGstin('07AAAAA0000A1Z5')).toBe('Delhi');
    expect(stateOfGstin('bad')).toBeNull();
    expect(sameState('Jammu & Kashmir', 'Jammu and Kashmir')).toBe(true);
  });

  it('numbers invoices by the April-to-March year', () => {
    expect(financialYear(new Date('2026-11-17T10:00:00Z'))).toBe('2026-27');
    expect(financialYear(new Date('2027-03-31T10:00:00Z'))).toBe('2026-27');
    expect(financialYear(new Date('2027-04-01T10:00:00Z'))).toBe('2027-28');
    expect(invoiceNumber('2026-27', 42)).toBe('LIL/2026-27/00042');
  });

  it('writes the amount in words', () => {
    expect(rupeesInWords(69_900_00)).toBe('Sixty Nine Thousand Nine Hundred Rupees Only');
    expect(rupeesInWords(1_25_00_000_00)).toBe('One Crore Twenty Five Lakh Rupees Only');
    expect(rupeesInWords(10_50)).toBe('Ten Rupees and Fifty Paise Only');
  });
});
