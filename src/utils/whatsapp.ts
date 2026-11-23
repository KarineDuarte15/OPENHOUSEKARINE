export const DEFAULT_WHATSAPP_NUMBER = '5585997004361';

/**
 * Normalizes a Brazilian phone number to digits with country code 55.
 */
export function normalizeWhatsAppNumber(raw?: string): string {
  const digits = String(raw || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, '');
  if (!digits) return DEFAULT_WHATSAPP_NUMBER;
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Formats a Brazilian phone number for display, e.g. (85) 99700-4361.
 */
export function formatWhatsAppDisplay(raw?: string): string {
  const normalized = normalizeWhatsAppNumber(raw);
  const local = normalized.startsWith('55') && normalized.length >= 12 ? normalized.slice(2) : normalized;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return local;
}

/**
 * Builds a wa.me deep link with a pre-filled UTF-8 encoded message.
 */
export function buildWhatsAppUrl(phoneNumber: string | undefined, message: string): string {
  const number = normalizeWhatsAppNumber(phoneNumber);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
