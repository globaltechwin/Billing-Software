import QRCode from "qrcode";

export interface UpiQrOptions {
  upiId: string;
  merchantName: string;
  amount: number;
  invoiceNumber: string;
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
}

export function buildUpiUri(opts: UpiQrOptions): string {
  const params = new URLSearchParams({
    pa: opts.upiId,
    pn: opts.merchantName,
    am: opts.amount.toFixed(2),
    cu: "INR",
    tn: `Invoice ${opts.invoiceNumber}`,
    tr: opts.invoiceNumber,
  });
  return `upi://pay?${params.toString()}`;
}

export async function generateUpiQrDataUrl(opts: UpiQrOptions): Promise<string> {
  const uri = buildUpiUri(opts);
  return QRCode.toDataURL(uri, {
    width: opts.size || 200,
    margin: 2,
    color: {
      dark: opts.foregroundColor || "#000000",
      light: opts.backgroundColor || "#ffffff",
    },
  });
}

export function isValidUpiId(upiId: string): boolean {
  return /^[\w.\-]+@[\w]+$/.test(upiId);
}
