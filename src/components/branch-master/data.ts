export interface Branch {
  id: number;
  companyId: number;
  branchCode: string | null;
  branchName: string;
  branchType: string;

  // POS Configuration
  connectionString: string | null;
  branchDisplayName: string | null;
  dayEndAutoClosing: boolean;
  customField1: string | null;
  customField2: string | null;
  rewardPoint: string | null;
  footerMsg: string | null;
  website: string | null;
  billCopy: string | null;
  openingTime: string | null;
  closingTime: string | null;
  graceHours: string | null;
  gstSummary: boolean;
  isBarCodeBill: boolean;
  couponPercent: string | null;
  couponValidity: string | null;
  indentApproval: boolean;
  isDeptKOT: boolean;
  unitPriceEdit: boolean;
  billNoReset: boolean;
  couponVisible: boolean;
  orderTypeBill: boolean;
  isZomato: boolean;
  isSwiggy: boolean;
  cloudLogo: string | null;

  // Contact
  contactPerson: string | null;
  phone: string | null;
  alternateMobile: string | null;
  email: string | null;

  // Address
  addr1: string | null;
  addr2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;

  // Tax
  gstin: string | null;
  pan: string | null;

  // Logo & Industry
  logo: string | null;
  industryID: string | null;
  textileGST: string | null;
  fssai: string | null;

  // Status
  isHeadOffice: boolean;
  isDefault: boolean;
  isActive: boolean;
  remarks: string | null;
  createdByUserId: number | null;
  updatedByUserId: number | null;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  updatedByName?: string;
}

export const sampleBranches: Branch[] = [
  {
    id: 7,
    companyId: 6,
    branchCode: "BR-0001",
    branchName: "Head Office",
    branchType: "Branch",
    connectionString: "Data Source=SQL5053.site4now.net;Initial Catalog=DB_A61E7E_demobd1;User Id=DB_A61E7E_demobd1_admin;Password=t4bill@123;",
    branchDisplayName: "Only Coffee Vegetarian Restaurant",
    dayEndAutoClosing: true,
    customField1: "Remarks",
    customField2: "Attender",
    rewardPoint: "1",
    footerMsg: "Powered by www.touch4bill.com",
    website: "2",
    billCopy: "1",
    openingTime: "07:00:00",
    closingTime: "15:00:00",
    graceHours: "08:00:00",
    gstSummary: true,
    isBarCodeBill: false,
    couponPercent: "10.00",
    couponValidity: "0.0000",
    indentApproval: false,
    isDeptKOT: true,
    unitPriceEdit: false,
    billNoReset: true,
    couponVisible: false,
    orderTypeBill: false,
    isZomato: false,
    isSwiggy: false,
    cloudLogo: "branch_2_logo.png",
    contactPerson: null,
    phone: "+91 98765 43210",
    alternateMobile: null,
    email: null,
    addr1: "S2H Foods And Enterprises Pvt Ltd Mahamaha Kulam, Kumbakonam- 612002 GSTIN: 33ABDCSS478H1Z4",
    addr2: "",
    city: null,
    state: null,
    country: "India",
    pincode: null,
    gstin: "",
    pan: null,
    logo: null,
    industryID: "1",
    textileGST: "1",
    fssai: "",
    isHeadOffice: true,
    isDefault: true,
    isActive: true,
    remarks: null,
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
