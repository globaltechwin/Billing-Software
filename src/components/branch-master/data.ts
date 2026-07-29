export interface Branch {
  id: string;
  branchName: string;
  connectionString: string;
  dayEndAutoClosing: boolean;
  customField1: string;
  customField2: string;
  rewardPoint: string;
  footerMsg: string;
  website: string;
  billCopy: string;
  openingTime: string;
  closingTime: string;
  graceHours: string;
  gstSummary: boolean;
  isBarCodeBill: boolean;
  couponPercent: string;
  indentApproval: boolean;
  isDeptKOT: boolean;
  unitPriceEdit: boolean;
  billNoReset: boolean;
  couponVisible: boolean;
  orderTypeBill: boolean;
  isZomato: boolean;
  isSwiggy: boolean;
  branchDisplayName: string;
  addr1: string;
  addr2: string;
  gstNo: string;
  phone: string;
  logo: string;
  industryID: string;
  textileGST: string;
  fssai: string;
}

export const sampleBranches: Branch[] = [
  {
    id: "2",
    branchName: "Demo2",
    connectionString: "Data Source=SQL5053.site4now.net;Initial Catalog=DB_A61E7E_demobd1;User Id=DB_A61E7E_demobd1_admin;Password=t4bill@123;",
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
    indentApproval: false,
    isDeptKOT: true,
    unitPriceEdit: false,
    billNoReset: true,
    couponVisible: false,
    orderTypeBill: false,
    isZomato: false,
    isSwiggy: false,
    branchDisplayName: "Only Coffee Vegetarian Restaurant",
    addr1: "S2H Foods And Enterprises Pvt Ltd Mahamaha Kulam, Kumbaknam- 612002 GSTIN: 33ABDCSS478H1Z4",
    addr2: "",
    gstNo: "",
    phone: "",
    logo: "C:/jpeg",
    industryID: "1",
    textileGST: "1",
    fssai: "",
  },
];
