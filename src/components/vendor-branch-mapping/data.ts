export interface Vendor {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
}

export interface VendorBranchMapping {
  id: string;
  vendorId: string;
  vendorName: string;
  branchId: string;
  branchName: string;
  isActive: boolean;
  createdDate: string;
}

export const vendorList: Vendor[] = [
  { id: "1", name: "Fresh Foods Ltd" },
  { id: "2", name: "Spice World" },
  { id: "3", name: "Rajesh kumar" },
  { id: "4", name: "Grain Traders" },
  { id: "5", name: "Oil Mart" },
  { id: "6", name: "Dairy Direct" },
];

export const branchList: Branch[] = [
  { id: "1", name: "Main Branch" },
  { id: "2", name: "Demo2" },
  { id: "3", name: "Second Branch" },
];

export const sampleMappings: VendorBranchMapping[] = [
  {
    id: "1",
    vendorId: "3",
    vendorName: "Rajesh kumar",
    branchId: "2",
    branchName: "Demo2",
    isActive: true,
    createdDate: "12/08/2024 17:37:24",
  },
];
