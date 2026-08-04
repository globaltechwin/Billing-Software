import { PrismaClient } from "@prisma/client";

type PrismaTx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/**
 * Check if a product's stock has dropped to or below its reorder level.
 * Falls back to the company's global lowStockAlert threshold when
 * the product's reorderLevel is 0 (default).
 */
export async function checkLowStock(
  tx: PrismaTx,
  companyId: number,
  productId: number
): Promise<void> {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      productName: true,
      currentStock: true,
      reorderLevel: true,
      unit: true,
    },
  });

  if (!product) return;

  const stock = Number(product.currentStock);
  let threshold = Number(product.reorderLevel);

  // Fallback to company-wide low stock alert threshold
  if (threshold <= 0) {
    const company = await tx.company.findUnique({
      where: { id: companyId },
      select: { lowStockAlert: true },
    });
    threshold = Number(company?.lowStockAlert ?? 0);
  }

  // No threshold configured anywhere — skip
  if (threshold <= 0) return;
  if (stock > threshold) return;

  // Deduplicate: one notification per product per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await tx.notification.findFirst({
    where: {
      companyId,
      type: "LOW_STOCK",
      productId,
      createdAt: { gte: today },
    },
  });

  if (existing) return;

  await tx.notification.create({
    data: {
      companyId,
      type: "LOW_STOCK",
      message: `${product.productName} is low on stock — ${stock} ${product.unit} remaining (threshold: ${threshold})`,
      productId,
    },
  });
}

/**
 * Check multiple products for low stock after a batch operation.
 */
export async function checkLowStockBulk(
  tx: PrismaTx,
  companyId: number,
  productIds: number[]
): Promise<void> {
  for (const pid of productIds) {
    await checkLowStock(tx, companyId, pid);
  }
}
