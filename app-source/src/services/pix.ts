import QRCode from 'qrcode';

/**
 * Standard Brazilian Central Bank (BACEN) PIX EMV BR-Code generator
 */
function crc16(buffer: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatEmvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePixPayload({
  key,
  merchantName,
  merchantCity,
  amount,
  txid = '***',
}: {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
}): string {
  if (!key) return '';

  const cleanKey = key.trim();
  const cleanName = (merchantName || 'RECEBEDOR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 25);
  const cleanCity = (merchantCity || 'BRASIL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15);
  const cleanTxId = (txid || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';

  // 00: Payload Format Indicator
  let payload = formatEmvField('00', '01');

  // 26: Merchant Account Information - PIX
  const gui = formatEmvField('00', 'br.gov.bcb.pix');
  const chavePix = formatEmvField('01', cleanKey);
  payload += formatEmvField('26', `${gui}${chavePix}`);

  // 52: Merchant Category Code
  payload += formatEmvField('52', '0000');

  // 53: Transaction Currency (986 = BRL)
  payload += formatEmvField('53', '986');

  // 54: Transaction Amount (optional)
  if (amount && amount > 0) {
    payload += formatEmvField('54', amount.toFixed(2));
  }

  // 58: Country Code
  payload += formatEmvField('58', 'BR');

  // 59: Merchant Name
  payload += formatEmvField('59', cleanName);

  // 60: Merchant City
  payload += formatEmvField('60', cleanCity);

  // 62: Additional Data Field Template (TxID)
  const additionalData = formatEmvField('05', cleanTxId);
  payload += formatEmvField('62', additionalData);

  // 63: CRC16 prefix
  payload += '6304';
  const checksum = crc16(payload);

  return `${payload}${checksum}`;
}

export async function generatePixQRCodeDataUrl(payload: string): Promise<string> {
  if (!payload) return '';
  try {
    return await QRCode.toDataURL(payload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating PIX QR code', err);
    return '';
  }
}
