export interface Vendor {
  id: number;
  vendorName: string;
  vendorCode: string;
}

export interface Branch {
  id: number;
  branchName: string;
}

export interface VendorBranchMapping {
  id: number;
  vendorId: number;
  vendorName: string;
  branchId: number;
  branchName: string;
  status: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  remarks: string | null;
  isActive: boolean;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
}
