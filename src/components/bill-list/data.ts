export interface Bill {
  id: string;
  billNo: string;
  billDate: string;
  orderType: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  amountDue: number;
  mobile: string;
  name: string;
  createdDate: string;
}

export const MOCK_BILLS: Bill[] = [
  {
    id: "1",
    billNo: "V00004",
    billDate: "27/07/2026",
    orderType: "Laundry Service",
    subTotal: 11,
    discount: 0,
    grandTotal: 11,
    paidAmount: 0,
    amountDue: 11,
    mobile: "9940393333",
    name: "Raju",
    createdDate: "27/07/2026 10:36",
  },
  {
    id: "2",
    billNo: "V00003",
    billDate: "27/07/2026",
    orderType: "Laundry Service",
    subTotal: 2080,
    discount: 0,
    grandTotal: 2080,
    paidAmount: 2080,
    amountDue: 0,
    mobile: "9940393333",
    name: "Raju",
    createdDate: "27/07/2026 09:15",
  },
  {
    id: "3",
    billNo: "V00002",
    billDate: "26/07/2026",
    orderType: "Dry Cleaning",
    subTotal: 200,
    discount: 0,
    grandTotal: 200,
    paidAmount: 200,
    amountDue: 0,
    mobile: "7010991925",
    name: "Rajesh",
    createdDate: "26/07/2026 18:42",
  },
  {
    id: "4",
    billNo: "V00001",
    billDate: "26/07/2026",
    orderType: "Ironing",
    subTotal: 100,
    discount: 0,
    grandTotal: 100,
    paidAmount: 100,
    amountDue: 0,
    mobile: "",
    name: "",
    createdDate: "26/07/2026 14:20",
  },
];