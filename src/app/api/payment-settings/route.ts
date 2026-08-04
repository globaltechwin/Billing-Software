import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

const UPI_REGEX = /^[\w.\-]+@[\w]+$/;

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const settings = await prisma.paymentSettings.findFirst({
      where: { companyId, isActive: true },
      include: {
        branch: { select: { id: true, branchName: true } },
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!settings) {
      return NextResponse.json({ success: true, settings: null });
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        merchantName: settings.merchantName,
        upiId: settings.upiId,
        qrEnabled: settings.qrEnabled,
        branchId: settings.branchId,
        branchName: settings.branch?.branchName || "",
        isActive: settings.isActive,
        createdBy: settings.createdByUser?.name || "",
        updatedBy: settings.updatedByUser?.name || "",
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error("Payment settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { merchantName, upiId, qrEnabled, branchId } = body;

    if (!merchantName || !String(merchantName).trim()) {
      return NextResponse.json({ error: "Merchant name is required" }, { status: 400 });
    }
    if (!upiId || !String(upiId).trim()) {
      return NextResponse.json({ error: "UPI ID is required" }, { status: 400 });
    }
    if (!UPI_REGEX.test(String(upiId).trim())) {
      return NextResponse.json({ error: "Invalid UPI ID format (e.g., name@bank)" }, { status: 400 });
    }

    const existing = await prisma.paymentSettings.findFirst({
      where: { companyId, branchId: branchId || null },
    });

    if (existing) {
      return NextResponse.json({ error: "Payment settings already exist for this branch. Use PATCH to update." }, { status: 409 });
    }

    const settings = await prisma.paymentSettings.create({
      data: {
        companyId,
        branchId: branchId || null,
        merchantName: String(merchantName).trim(),
        upiId: String(upiId).trim(),
        qrEnabled: qrEnabled !== false,
        createdByUserId: userId,
      },
      include: {
        branch: { select: { id: true, branchName: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        merchantName: settings.merchantName,
        upiId: settings.upiId,
        qrEnabled: settings.qrEnabled,
        branchId: settings.branchId,
        branchName: settings.branch?.branchName || "",
        createdBy: settings.createdByUser?.name || "",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Payment settings POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { id, merchantName, upiId, qrEnabled, isActive } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.paymentSettings.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Payment settings not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (merchantName !== undefined) {
      if (!String(merchantName).trim()) return NextResponse.json({ error: "Merchant name is required" }, { status: 400 });
      data.merchantName = String(merchantName).trim();
    }
    if (upiId !== undefined) {
      if (!String(upiId).trim()) return NextResponse.json({ error: "UPI ID is required" }, { status: 400 });
      if (!UPI_REGEX.test(String(upiId).trim())) {
        return NextResponse.json({ error: "Invalid UPI ID format (e.g., name@bank)" }, { status: 400 });
      }
      data.upiId = String(upiId).trim();
    }
    if (qrEnabled !== undefined) data.qrEnabled = Boolean(qrEnabled);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    data.updatedByUserId = userId;

    const updated = await prisma.paymentSettings.update({
      where: { id },
      data,
      include: {
        branch: { select: { id: true, branchName: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        id: updated.id,
        merchantName: updated.merchantName,
        upiId: updated.upiId,
        qrEnabled: updated.qrEnabled,
        branchId: updated.branchId,
        branchName: updated.branch?.branchName || "",
        updatedBy: updated.updatedByUser?.name || "",
      },
    });
  } catch (error) {
    console.error("Payment settings PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.paymentSettings.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Payment settings not found" }, { status: 404 });

    await prisma.paymentSettings.update({ where: { id }, data: { isActive: false } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment settings DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
