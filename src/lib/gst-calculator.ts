import { Decimal } from "@prisma/client/runtime/library";

export type GSTType = "INTRASTATE" | "INTERSTATE";

export interface GSTInput {
  companyStateCode: string;
  customerStateCode: string;
  productPrice: number;
  gstMaster: {
    totalPercentage: Decimal;
    cgstPercentage: Decimal;
    sgstPercentage: Decimal;
    igstPercentage: Decimal;
  };
}

export interface GSTResult {
  gstType: GSTType;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateGST(input: GSTInput): GSTResult {
  const { companyStateCode, customerStateCode, productPrice, gstMaster } = input;

  const totalPct = Number(gstMaster.totalPercentage);
  const cgstPct = Number(gstMaster.cgstPercentage);
  const sgstPct = Number(gstMaster.sgstPercentage);
  const igstPct = Number(gstMaster.igstPercentage);

  const sameState = companyStateCode === customerStateCode;
  const gstType: GSTType = sameState ? "INTRASTATE" : "INTERSTATE";

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (gstType === "INTRASTATE") {
    cgstAmount = (productPrice * cgstPct) / 100;
    sgstAmount = (productPrice * sgstPct) / 100;
  } else {
    igstAmount = (productPrice * igstPct) / 100;
  }

  const taxAmount = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = productPrice + taxAmount;

  return {
    gstType,
    cgstPercentage: cgstPct,
    sgstPercentage: sgstPct,
    igstPercentage: igstPct,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    igstAmount: Math.round(igstAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}
