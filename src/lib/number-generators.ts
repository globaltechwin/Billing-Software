import { prisma } from "@/lib/prisma";

const CODE_FIELD_MAP: Record<string, string> = {
  vendor: "vendorCode",
  purchaseOrder: "poNumber",
  advanceOrder: "orderNumber",
  goodsReceipt: "grnNumber",
  purchaseInvoice: "invoiceNumber",
  vendorPayment: "paymentNumber",
  invoicePayment: "paymentNumber",
  kitchenOrder: "kotNumber",
  estimate: "estimateNumber",
  stockOut: "stockOutNumber",
  stockAudit: "auditNumber",
  indent: "indentNumber",
  productionPlan: "planNo",
  productionIn: "prodNo",
  productionOut: "outNo",
  wastage: "wastageNo",
  cashCategory: "categoryId",
  cashAccount: "accountId",
  cashTransaction: "transactionId",
  quote: "quoteNumber",
  accountingInvoice: "invoiceNumber",
};

async function getNextNumber(
  companyId: number,
  model: string,
  prefix: string,
  digits: number = 6
): Promise<string> {
  const codeField = CODE_FIELD_MAP[model] || (prefix.toLowerCase() + "Number");

  const prismaModel = prisma as unknown as Record<
    string,
    { findFirst: (args: { where: { companyId: number }; orderBy: { id: "desc" }; select: Record<string, boolean> }) => Promise<Record<string, unknown> | null> }
  >;
  const lastRecord = await prismaModel[model]?.findFirst({
    where: { companyId },
    orderBy: { id: "desc" },
    select: { [codeField]: true },
  });

  let nextNum = 1;
  if (lastRecord && lastRecord[codeField]) {
    const match = String(lastRecord[codeField]).match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${String(nextNum).padStart(digits, "0")}`;
}

export async function generateVendorCode(companyId: number): Promise<string> {
  return getNextNumber(companyId, "vendor", "VEND", 4);
}

export async function generatePONumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "purchaseOrder", "PO", 6);
}

export async function generateGRNNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "goodsReceipt", "GRN", 6);
}

export async function generatePurchaseInvoiceNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "purchaseInvoice", "PINV", 6);
}

export async function generateVendorPaymentNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "vendorPayment", "PAY", 6);
}

export async function generateStockOutNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "stockOut", "SO", 6);
}

export async function generateAuditNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "stockAudit", "SA", 6);
}

export async function generateIndentNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "indent", "IND", 6);
}

export async function generateCustomerPaymentNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "invoicePayment", "CPAY", 6);
}

export async function generateKOTNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "kitchenOrder", "KOT", 6);
}

export async function generateEstimateNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "estimate", "EST", 6);
}

export async function generateExpenseNumber(companyId: number): Promise<string> {
  const lastRecord = await prisma.expense.findFirst({
    where: { companyId },
    orderBy: { id: "desc" },
    select: { expenseNumber: true },
  });

  let nextNum = 1000;
  if (lastRecord?.expenseNumber) {
    const match = lastRecord.expenseNumber.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1], 10);
  }
  return `EXP-${nextNum + 1}`;
}

export async function generateAdvanceOrderNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "advanceOrder", "ADV", 6);
}

export async function generateProductionPlanNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "productionPlan", "PP", 6);
}

export async function generateProductionInNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "productionIn", "PIN", 6);
}

export async function generateProductionOutNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "productionOut", "POUT", 6);
}

export async function generateWastageNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "wastage", "WAS", 6);
}

export async function generateCashCategoryId(companyId: number): Promise<string> {
  return getNextNumber(companyId, "cashCategory", "CAT-", 3);
}

export async function generateCashAccountId(companyId: number): Promise<string> {
  return getNextNumber(companyId, "cashAccount", "ACC-", 3);
}

export async function generateCashTransactionId(companyId: number): Promise<string> {
  return getNextNumber(companyId, "cashTransaction", "CTX-", 6);
}

export async function generateQuoteNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "quote", "QT-", 4);
}

export async function generateAccountingInvoiceNumber(companyId: number): Promise<string> {
  return getNextNumber(companyId, "accountingInvoice", "INV-", 4);
}
