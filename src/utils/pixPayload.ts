/**
 * Helper to generate a valid standard Pix BR Code EMV payload.
 * Follows Central Bank of Brazil (BCB) specifications.
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function normalizeString(str: string, maxLength: number): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .substring(0, maxLength)
    .trim();
}

function calculateCRC16(str: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < str.length; i++) {
    let byte = str.charCodeAt(i);
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload(key: string, name: string = 'Karine e Lucas', city: string = 'SAO PAULO'): string {
  const cleanKey = key.trim();
  const cleanName = normalizeString(name, 25) || 'ANFITRIOES';
  const cleanCity = normalizeString(city, 15) || 'SAO PAULO';

  // ID 26: Merchant Account Information
  const merchantAccountInfo =
    formatField('00', 'br.gov.bcb.pix') +
    formatField('01', cleanKey);

  let payload =
    formatField('00', '01') + // Format Indicator
    formatField('26', merchantAccountInfo) + // Account Info
    formatField('52', '0000') + // Category Code
    formatField('53', '986') + // BRL Currency
    formatField('58', 'BR') + // Country
    formatField('59', cleanName) + // Name
    formatField('60', cleanCity) + // City
    formatField('62', formatField('05', '***')); // Additional Data

  payload += '6304'; // CRC16 Header
  payload += calculateCRC16(payload);

  return payload;
}
