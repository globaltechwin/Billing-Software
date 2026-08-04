import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(companyId: number): Promise<string> {
  const prefix = `INV${companyId}-`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      companyId,
      invoiceNumber: { startsWith: prefix },
    },
    orderBy: { id: "desc" },
    select: { invoiceNumber: true },
  });

  if (!lastInvoice) {
    return `${prefix}0001`;
  }

  const lastNum = parseInt(lastInvoice.invoiceNumber.replace(prefix, ""), 10);
  const nextNum = lastNum + 1;
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}
