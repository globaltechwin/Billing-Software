import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";
import { generateVendorCode } from "@/lib/number-generators";

const ALLOWED_SORT_FIELDS = [
  "id",
  "vendorCode",
  "vendorName",
  "mobileNumber",
  "gstNumber",
  "city",
  "creditLimit",
  "isActive",
  "createdAt",
];

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function normalizeMobile(mobile: string): string {
  return mobile.trim().replace(/\s+/g, "");
}

function serializeVendor(v: {
  creditLimit: { toString(): string };
  openingBalance: { toString(): string };
  currentBalance: { toString(): string };
} & Record<string, unknown>) {
  return {
    ...v,
    creditLimit: v.creditLimit.toString(),
    openingBalance: v.openingBalance.toString(),
    currentBalance: v.currentBalance.toString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const vendorName = searchParams.get("vendorName");
    const vendorCode = searchParams.get("vendorCode");
    const mobile = searchParams.get("mobile");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = { companyId };

    if (searchParams.get("activeOnly") === "true") where.isActive = true;
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    if (vendorName) where.vendorName = { contains: vendorName };
    if (vendorCode) where.vendorCode = { contains: vendorCode };
    if (mobile) where.mobileNumber = { contains: mobile };
    if (city) where.city = { contains: city };

    if (search) {
      where.OR = [
        { vendorName: { contains: search } },
        { vendorCode: { contains: search } },
        { mobileNumber: { contains: search } },
        { alternateMobile: { contains: search } },
        { email: { contains: search } },
        { gstNumber: { contains: search } },
        { contactPerson: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const orderField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      vendors: vendors.map(serializeVendor),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Vendor list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();

    const vendorName = body.vendorName?.trim();
    const mobileNumber = normalizeMobile(body.mobileNumber || "");

    if (!vendorName) {
      return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
    }
    if (!mobileNumber) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    const duplicateMobile = await prisma.vendor.findFirst({
      where: { companyId, mobileNumber },
    });
    if (duplicateMobile) {
      return NextResponse.json(
        { error: "A vendor with this mobile number already exists" },
        { status: 409 }
      );
    }

    let gstNumber: string | null = null;
    if (body.gstNumber) {
      gstNumber = body.gstNumber.trim();
      if (!GST_REGEX.test(gstNumber!)) {
        return NextResponse.json({ error: "Invalid GST number format" }, { status: 400 });
      }
      const duplicateGst = await prisma.vendor.findFirst({
        where: { companyId, gstNumber },
      });
      if (duplicateGst) {
        return NextResponse.json(
          { error: "A vendor with this GST number already exists" },
          { status: 409 }
        );
      }
    }

    const vendorCode = await generateVendorCode(companyId);
    const openingBalance = parseFloat(body.openingBalance) || 0;

    const vendor = await prisma.vendor.create({
      data: {
        companyId,
        vendorCode,
        vendorName,
        contactPerson: body.contactPerson?.trim() || null,
        mobileNumber,
        alternateMobile: body.alternateMobile?.trim() || null,
        email: body.email?.trim() || null,
        gstNumber,
        panNumber: body.panNumber?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        stateCode: body.stateCode?.trim() || null,
        country: body.country?.trim() || "India",
        postalCode: body.postalCode?.trim() || null,
        paymentTerms: body.paymentTerms?.trim() || null,
        creditLimit: parseFloat(body.creditLimit) || 0,
        openingBalance,
        currentBalance: openingBalance,
        isActive: body.isActive !== false,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, vendor: serializeVendor(vendor) }, { status: 201 });
  } catch (error) {
    console.error("Vendor creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.vendor.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    if (updateData.mobileNumber) {
      const mobileNumber = normalizeMobile(updateData.mobileNumber);
      const duplicateMobile = await prisma.vendor.findFirst({
        where: { companyId, mobileNumber, id: { not: id } },
      });
      if (duplicateMobile) {
        return NextResponse.json(
          { error: "A vendor with this mobile number already exists" },
          { status: 409 }
        );
      }
      updateData.mobileNumber = mobileNumber;
    }

    if (updateData.gstNumber) {
      const gstNumber = updateData.gstNumber.trim();
      if (!GST_REGEX.test(gstNumber)) {
        return NextResponse.json({ error: "Invalid GST number format" }, { status: 400 });
      }
      const duplicateGst = await prisma.vendor.findFirst({
        where: { companyId, gstNumber, id: { not: id } },
      });
      if (duplicateGst) {
        return NextResponse.json(
          { error: "A vendor with this GST number already exists" },
          { status: 409 }
        );
      }
      updateData.gstNumber = gstNumber;
    }

    if (updateData.creditLimit !== undefined) {
      updateData.creditLimit = parseFloat(updateData.creditLimit) || 0;
    }

    if (updateData.openingBalance !== undefined) {
      const newOpening = parseFloat(updateData.openingBalance) || 0;
      const delta = newOpening - Number(existing.openingBalance);
      updateData.openingBalance = newOpening;
      updateData.currentBalance = Number(existing.currentBalance) + delta;
    }

    updateData.updatedByUserId = userId;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, vendor: serializeVendor(vendor) });
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.vendor.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const [poCount, grnCount, invoiceCount, paymentCount, branchMappingCount] =
      await Promise.all([
        prisma.purchaseOrder.count({ where: { vendorId: id } }),
        prisma.goodsReceipt.count({ where: { vendorId: id } }),
        prisma.purchaseInvoice.count({ where: { vendorId: id } }),
        prisma.vendorPayment.count({ where: { vendorId: id } }),
        prisma.vendorBranchMapping.count({ where: { vendorId: id } }),
      ]);

    if (poCount > 0 || grnCount > 0 || invoiceCount > 0 || paymentCount > 0 || branchMappingCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this vendor because they have associated purchase orders, goods receipts, invoices, payments, or branch mappings.",
        },
        { status: 409 }
      );
    }

    await prisma.vendor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vendor delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
