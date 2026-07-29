export interface WalletTransaction {
  id: string;
  cardNumber: string;
  employeeId: string;
  customerName: string;
  mobile: string;
  amount: number;
  paymentMode: string;
  transactionDate: string;
  status: string;
}

export const sampleWalletTransactions: WalletTransaction[] = [];

export const paymentModes = [
  "-- Payment Mode --",
  "Cash",
  "Card",
  "UPI",
  "Bank Transfer",
  "Other",
];
