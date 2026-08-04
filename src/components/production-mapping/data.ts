export interface ProductionMapping {
  id: number;
  companyId: number;
  mappingType: string;
  itemId: number;
  itemName: string;
  itemCode: string | null;
  productId: number;
  productName: string;
  productCode: string | null;
  quantity: number;
  unit: string;
  purchasePrice: number;
  cost: number;
  isActive: boolean;
  createdByUser: { id: number; name: string } | null;
  updatedByUser: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionConversion {
  id: number;
  companyId: number;
  productId: number;
  productName: string;
  productCode: string | null;
  baseQty: number;
  baseUnit: string;
  portionQty: number;
  isActive: boolean;
  createdByUser: { id: number; name: string } | null;
  updatedByUser: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SelectProduct {
  id: number;
  productName: string;
  productCode: string | null;
}

export interface SelectUnit {
  id: number;
  unitName: string;
  shortName: string;
}
