export interface Customer {
  id: number;
  companyId: number;
  customerCode: string | null;
  customerName: string;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  address: string | null;
  addressLine2: string | null;
  city: string | null;
  stateName: string;
  stateCode: string;
  country: string;
  pincode: string | null;
  customerType: string;
  creditLimit: string;
  creditDays: number;
  priceList: string | null;
  remarks: string | null;
  isActive: boolean;
  createdByUserId: number | null;
  updatedByUserId: number | null;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  updatedByName?: string;
  outstandingBalance?: number;
}

export const CUSTOMER_TYPES = ["INDIVIDUAL", "BUSINESS"];
