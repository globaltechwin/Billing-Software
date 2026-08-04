export interface ProductRecord {
  id: number;
  productName: string;
  productCode: string | null;
  description: string | null;
  category: string | null;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  barcode: string | null;
  hsnCode: string | null;
  gstApplicable: boolean;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  isActive: boolean;
  gstMaster: {
    id: number;
    name: string;
    totalPercentage: number;
  } | null;
}

export interface GSTRate {
  id: number;
  name: string;
  totalPercentage: number;
}

export interface ApiVendor {
  id: number;
  vendorName: string;
}

export interface BulkUpdateFields {
  sellingPrice?: number;
  purchasePrice?: number;
  gstMasterId?: number;
  category?: string;
  unit?: string;
  barcode?: string | null;
  reorderLevel?: number;
  isActive?: boolean;
}
