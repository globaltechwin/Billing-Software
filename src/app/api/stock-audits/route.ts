import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateAuditNumber } from "@/lib/number-generators";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const audits = await prisma.stockAudit.findMany({
      where: { companyId },
      include: {
        createdByUser: { select: { name: true } },
        items: {
          include: {
            product: { select: { id: true, productName: true, unit: true, currentStock: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, audits });
  } catch (error) {
    console.error("Stock audit list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { auditType, auditor, remarks, items, auditDate } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    if (!auditor) {
      return NextResponse.json({ error: "Auditor name is required" }, { status: 400 });
    }

    const auditNumber = await generateAuditNumber(companyId);

    const result = await prisma.$transaction(async (tx) => {
      const stockAudit = await tx.stockAudit.create({
        data: {
          auditNumber,
          companyId,
          auditType: auditType || "FULL",
          auditor,
          remarks: remarks || null,
          auditDate: auditDate ? new Date(auditDate) : new Date(),
          status: "COMPLETED",
          createdByUserId: userId,
        },
      });

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const systemStock = Number(product.currentStock);
        const physicalStock = Number(item.physicalStock);
        const difference = physicalStock - systemStock;
        const adjustmentType = difference > 0 ? "EXCESS" : difference < 0 ? "SHORTAGE" : "NO_ADJUSTMENT";

        await tx.stockAuditItem.create({
          data: {
            stockAuditId: stockAudit.id,
            productId: item.productId,
            systemStock,
            physicalStock,
            difference,
            adjustmentType,
            remarks: item.remarks || null,
          },
        });

        // Update product stock to audited quantity
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: physicalStock },
        });

        // Create inventory ledger entry if there's a difference
        if (difference !== 0) {
          await tx.inventoryLedger.create({
            data: {
              companyId,
              productId: item.productId,
              quantityIn: difference > 0 ? difference : 0,
              quantityOut: difference < 0 ? Math.abs(difference) : 0,
              balance: physicalStock,
              referenceType: "ADJUSTMENT",
              referenceId: stockAudit.id,
              referenceNumber: auditNumber,
              notes: `Stock Audit Adjustment - ${adjustmentType}: ${Math.abs(difference)}`,
              createdByUserId: userId,
            },
          });
        }
      }

      return stockAudit;
    });

    return NextResponse.json({ success: true, audit: result }, { status: 201 });
  } catch (error) {
    console.error("Stock audit creation error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
