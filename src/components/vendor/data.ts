export interface Vendor {
  id: string;
  vendorId: number;
  vendorName: string;
  primaryContact: string;
  mobile: string;
  gstin: string;
  pan: string;
  email: string;
  address: string;
}

export const sampleVendors: Vendor[] = [
  { id: "1", vendorId: 3, vendorName: "Rajesh kumar", primaryContact: "", mobile: "7010991925", gstin: "Gf25crt5kd645gy", pan: "", email: "rkselvakumar07@gmail.com", address: "chennai" },
  { id: "2", vendorId: 4, vendorName: "Arasu", primaryContact: "", mobile: "9787022707", gstin: "234423423423423", pan: "", email: "arasu_s@yahoo.com", address: "" },
  { id: "3", vendorId: 5, vendorName: "MadhuAshwath", primaryContact: "Raja", mobile: "1234567890", gstin: "gjhgu7867866868", pan: "", email: "", address: "Ramapur" },
  { id: "4", vendorId: 7, vendorName: "vijayaraj R", primaryContact: "", mobile: "8220368665", gstin: "", pan: "", email: "vijayarajr00@gmail.com", address: "" },
  { id: "5", vendorId: 8, vendorName: "Abdul", primaryContact: "", mobile: "7358322730", gstin: "", pan: "", email: "", address: "" },
  { id: "6", vendorId: 9, vendorName: "RAJA", primaryContact: "", mobile: "9944418662", gstin: "231234234234234", pan: "", email: "", address: "P" },
  { id: "7", vendorId: 10, vendorName: "Madhu", primaryContact: "", mobile: "9944418663", gstin: "654654654645654", pan: "6786786786", email: "pradeepkumar.b@ciarss.com", address: "Chennai" },
];
