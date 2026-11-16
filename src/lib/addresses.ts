import { apiFetch } from './api-client';

/* Saved delivery addresses, as the backend's /addresses returns them. Used
   by the Saved addresses page and, later, checkout. */

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  postalCode: string;
  /** Flat, house no., building. */
  line1: string;
  /** Area, street, sector, village. */
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  label: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export type AddressInput = Omit<SavedAddress, 'id' | 'isDefault' | 'line2' | 'landmark'> & {
  line2: string;
  landmark: string;
  isDefault: boolean;
};

export const EMPTY_ADDRESS: AddressInput = {
  fullName: '',
  phone: '',
  postalCode: '',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  label: 'Home',
  isDefault: false,
};

export const listAddresses = () => apiFetch<SavedAddress[]>('/addresses');
export const createAddress = (body: AddressInput) => apiFetch<SavedAddress>('/addresses', { method: 'POST', body });
export const updateAddress = (id: string, body: AddressInput) =>
  apiFetch<SavedAddress>(`/addresses/${id}`, { method: 'PATCH', body });
export const removeAddress = (id: string) => apiFetch<SavedAddress[]>(`/addresses/${id}`, { method: 'DELETE' });
export const makeDefaultAddress = (id: string) =>
  apiFetch<SavedAddress[]>(`/addresses/${id}/default`, { method: 'POST' });

/** "+91 98765 43210" → "9876543210", as the backend stores it. */
export const cleanPhone = (raw: string) => raw.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');

/** What is wrong with a filled-in form, field by field — the same rules the
 *  backend applies, checked here first so mistakes show without a round
 *  trip. */
export function addressErrors(a: AddressInput): Partial<Record<keyof AddressInput, string>> {
  const errors: Partial<Record<keyof AddressInput, string>> = {};
  if (a.fullName.trim().length < 2) errors.fullName = 'Enter the name of the person receiving the order.';
  if (!/^[6-9]\d{9}$/.test(cleanPhone(a.phone))) errors.phone = 'Enter a 10-digit mobile number.';
  if (!/^[1-9]\d{5}$/.test(a.postalCode.trim())) errors.postalCode = 'Enter a 6-digit PIN code.';
  if (a.line1.trim().length < 3) errors.line1 = 'Enter the flat, house number or building.';
  if (a.city.trim().length < 2) errors.city = 'Enter the city or town.';
  if (!a.state) errors.state = 'Choose a state.';
  return errors;
}

/** The address as one line of text, for summaries. */
export function addressLine(a: Pick<SavedAddress, 'line1' | 'line2' | 'landmark' | 'city' | 'state' | 'postalCode'>) {
  return [a.line1, a.line2, a.landmark && `Near ${a.landmark}`, a.city, `${a.state} - ${a.postalCode}`]
    .filter(Boolean)
    .join(', ');
}
