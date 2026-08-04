const ORDER_TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Dine In",
  TAKE_AWAY: "Take Away",
  DELIVERY: "Delivery",
};

const PAY_MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  CHEQUE: "Cheque",
  BANK: "Bank",
  WALLET: "Wallet",
  CREDIT: "Credit",
  COMPLIMENT: "Compliment",
};

export function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDate(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateTime(d: Date): string {
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateTimeSeconds(d: Date): string {
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function payModeLabel(mode: string | null | undefined): string {
  if (!mode) return "Cash";
  const upper = mode.toUpperCase();
  return PAY_MODE_LABELS[upper] || mode;
}

export function orderTypeLabel(type: string | null | undefined): string {
  if (!type) return "";
  return ORDER_TYPE_LABELS[type] || type;
}

export function buildDateRange(
  fromDate: string | null,
  fromTime: string,
  toDate: string | null,
  toTime: string
): { gte?: Date; lte?: Date } {
  const range: { gte?: Date; lte?: Date } = {};
  if (fromDate) {
    const gte = new Date(`${fromDate}T${fromTime || "00:00"}:00`);
    if (!Number.isNaN(gte.getTime())) range.gte = gte;
  }
  if (toDate) {
    const lte = new Date(`${toDate}T${toTime || "23:59"}:59`);
    if (!Number.isNaN(lte.getTime())) range.lte = lte;
  }
  return range;
}

export function getSession(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Morning";
  if (h < 16) return "Afternoon";
  return "Evening";
}
