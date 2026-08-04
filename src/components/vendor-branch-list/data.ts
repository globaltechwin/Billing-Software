export interface VendorBranchMapping {
  id: number;
  vendorId: number;
  vendorName: string;
  vendorCode: string;
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

export interface Vendor {
  id: number;
  vendorName: string;
}

export interface Branch {
  id: number;
  branchName: string;
}
