import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

const GST_MODES = ["GST_VISIBLE", "GST_INCLUDED_HIDDEN", "GST_IGST", "NO_GST", "GST_ITEM_WISE"];

// GET /api/company/gst-settings — get company GST settings
export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        companyName: true,
        gstNumber: true,
        gstStateCode: true,
        stateName: true,
        gstEnabled: true,
        gstMode: true,
        roundOffEnabled: true,
        allowInvoiceGstOverride: true,
        defaultHsnRequired: true,
        allowCustomGstRate: true,
        createdByUserId: true,
        updatedByUserId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, gstSettings: company });
  } catch (error) {
    console.error("GST settings fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/company/gst-settings — update company GST settings
export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const {
      gstNumber,
      gstStateCode,
      stateName,
      gstEnabled,
      gstMode,
      roundOffEnabled,
      allowInvoiceGstOverride,
      defaultHsnRequired,
      allowCustomGstRate,
    } = body;

    const existing = await prisma.company.findUnique({ where: { id: companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Validate GST number format if provided (15-char alphanumeric: 2 digit state code + PAN + 1 char + Z + 1 digit)
    if (gstNumber !== undefined && gstNumber !== null && gstNumber !== "") {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber)) {
        return NextResponse.json(
          { error: "Invalid GST number format. Expected: 2 digit state code + PAN + 1 char + Z + 1 digit" },
          { status: 400 }
        );
      }
    }

    if (gstMode !== undefined && !GST_MODES.includes(gstMode)) {
      return NextResponse.json(
        { error: "Invalid GST mode. Must be one of: " + GST_MODES.join(", ") },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { updatedByUserId: userId };
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber || null;
    if (gstStateCode !== undefined) updateData.gstStateCode = gstStateCode || null;
    if (stateName !== undefined) updateData.stateName = stateName;
    if (gstEnabled !== undefined) updateData.gstEnabled = gstEnabled;
    if (gstMode !== undefined) updateData.gstMode = gstMode;
    if (roundOffEnabled !== undefined) updateData.roundOffEnabled = roundOffEnabled;
    if (allowInvoiceGstOverride !== undefined) updateData.allowInvoiceGstOverride = allowInvoiceGstOverride;
    if (defaultHsnRequired !== undefined) updateData.defaultHsnRequired = defaultHsnRequired;
    if (allowCustomGstRate !== undefined) updateData.allowCustomGstRate = allowCustomGstRate;

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      select: {
        id: true,
        companyName: true,
        gstNumber: true,
        gstStateCode: true,
        stateName: true,
        gstEnabled: true,
        gstMode: true,
        roundOffEnabled: true,
        allowInvoiceGstOverride: true,
        defaultHsnRequired: true,
        allowCustomGstRate: true,
        createdByUserId: true,
        updatedByUserId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, gstSettings: company });
  } catch (error) {
    console.error("GST settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
