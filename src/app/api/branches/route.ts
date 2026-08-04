import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

const ALLOWED_SORT_FIELDS = [
  "id",
  "branchCode",
  "branchName",
  "branchType",
  "phone",
  "city",
  "gstin",
  "isActive",
  "createdAt",
];

async function generateBranchCode(companyId: number): Promise<string> {
  const branches = await prisma.branch.findMany({
    where: { companyId, branchCode: { not: null } },
    select: { branchCode: true },
  });

  let max = 0;
  for (const b of branches) {
    const match = (b.branchCode || "").match(/(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }

  return `BR-${String(max + 1).padStart(4, "0")}`;
}

function cleanStr(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function cleanBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1";
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const branchName = searchParams.get("branchName");
    const branchCode = searchParams.get("branchCode");
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
    if (branchName) where.branchName = { contains: branchName };
    if (branchCode) where.branchCode = { contains: branchCode };
    if (mobile) where.phone = { contains: mobile };
    if (city) where.city = { contains: city };

    if (search) {
      where.OR = [
        { branchName: { contains: search } },
        { branchCode: { contains: search } },
        { phone: { contains: search } },
        { alternateMobile: { contains: search } },
        { email: { contains: search } },
        { contactPerson: { contains: search } },
        { gstin: { contains: search } },
        { city: { contains: search } },
        { branchDisplayName: { contains: search } },
      ];
    }

    const orderField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        include: {
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.branch.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      branches,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Branch list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();

    const branchName = body.branchName?.trim();
    if (!branchName) {
      return NextResponse.json({ error: "Branch Name is required" }, { status: 400 });
    }

    const duplicateName = await prisma.branch.findFirst({
      where: { companyId, branchName },
    });
    if (duplicateName) {
      return NextResponse.json(
        { error: "A branch with this name already exists" },
        { status: 409 }
      );
    }

    if (body.gstNo) {
      const duplicateGst = await prisma.branch.findFirst({
        where: { companyId, gstin: body.gstNo.trim() },
      });
      if (duplicateGst) {
        return NextResponse.json(
          { error: "A branch with this GSTIN already exists" },
          { status: 409 }
        );
      }
    }

    const branchCode = await generateBranchCode(companyId);

    const branch = await prisma.branch.create({
      data: {
        companyId,
        branchCode,
        branchName,
        branchType: body.branchType || "Branch",

        connectionString: cleanStr(body.connectionString),
        branchDisplayName: cleanStr(body.branchDisplayName),
        dayEndAutoClosing: body.dayEndAutoClosing !== false,
        customField1: cleanStr(body.customField1),
        customField2: cleanStr(body.customField2),
        rewardPoint: cleanStr(body.rewardPoint),
        footerMsg: cleanStr(body.footerMsg),
        website: cleanStr(body.website),
        billCopy: cleanStr(body.billCopy),
        openingTime: cleanStr(body.openingTime),
        closingTime: cleanStr(body.closingTime),
        graceHours: cleanStr(body.graceHours),
        gstSummary: body.gstSummary !== false,
        isBarCodeBill: body.isBarCodeBill !== false,
        couponPercent: cleanStr(body.couponPercent),
        couponValidity: cleanStr(body.couponValidity),
        indentApproval: body.indentApproval !== false,
        isDeptKOT: body.isDeptKOT !== false,
        unitPriceEdit: body.unitPriceEdit !== false,
        billNoReset: body.billNoReset !== false,
        couponVisible: body.couponVisible !== false,
        orderTypeBill: body.orderTypeBill !== false,
        isZomato: body.isZomato !== false,
        isSwiggy: body.isSwiggy !== false,
        cloudLogo: cleanStr(body.cloudLogo),

        contactPerson: cleanStr(body.contactPerson),
        phone: cleanStr(body.phone),
        alternateMobile: cleanStr(body.alternateMobile),
        email: cleanStr(body.email),

        addr1: cleanStr(body.addr1),
        addr2: cleanStr(body.addr2),
        city: cleanStr(body.city),
        state: cleanStr(body.state),
        country: cleanStr(body.country) || "India",
        pincode: cleanStr(body.pincode),

        gstin: cleanStr(body.gstNo),
        pan: cleanStr(body.pan),

        logo: cleanStr(body.logo),
        industryID: cleanStr(body.industryID),
        textileGST: cleanStr(body.textileGST),
        fssai: cleanStr(body.fssai),

        isHeadOffice: body.isHeadOffice || false,
        isDefault: body.isDefault || false,
        isActive: body.isActive !== false,
        remarks: cleanStr(body.remarks),
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, branch }, { status: 201 });
  } catch (error) {
    console.error("Branch creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();
    const { id, ...rawUpdateData } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.branch.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};

    if (rawUpdateData.branchName !== undefined) {
      const branchName = rawUpdateData.branchName.trim();
      const duplicateName = await prisma.branch.findFirst({
        where: { companyId, branchName, id: { not: id } },
      });
      if (duplicateName) {
        return NextResponse.json(
          { error: "A branch with this name already exists" },
          { status: 409 }
        );
      }
      updateData.branchName = branchName;
    }

    if (rawUpdateData.gstNo !== undefined) {
      const gstin = rawUpdateData.gstNo?.trim() || null;
      if (gstin) {
        const duplicateGst = await prisma.branch.findFirst({
          where: { companyId, gstin, id: { not: id } },
        });
        if (duplicateGst) {
          return NextResponse.json(
            { error: "A branch with this GSTIN already exists" },
            { status: 409 }
          );
        }
      }
      updateData.gstin = gstin;
    }

    if (rawUpdateData.isDefault === true) {
      await prisma.branch.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // String fields
    const strFields = [
      "branchName", "branchType", "connectionString", "branchDisplayName",
      "customField1", "customField2", "rewardPoint", "footerMsg",
      "website", "billCopy", "openingTime", "closingTime", "graceHours",
      "couponPercent", "couponValidity", "cloudLogo",
      "contactPerson", "phone", "alternateMobile", "email",
      "addr1", "addr2", "city", "state", "country", "pincode",
      "pan", "logo", "industryID", "textileGST", "fssai", "remarks",
    ];
    for (const f of strFields) {
      if (rawUpdateData[f] !== undefined) {
        updateData[f] = typeof rawUpdateData[f] === "string" ? rawUpdateData[f].trim() || null : rawUpdateData[f];
      }
    }

    // Boolean fields
    const boolFields = [
      "dayEndAutoClosing", "gstSummary", "isBarCodeBill",
      "indentApproval", "isDeptKOT", "unitPriceEdit", "billNoReset",
      "couponVisible", "orderTypeBill", "isZomato", "isSwiggy",
      "isHeadOffice", "isDefault", "isActive",
    ];
    for (const f of boolFields) {
      if (rawUpdateData[f] !== undefined) {
        updateData[f] = cleanBool(rawUpdateData[f]);
      }
    }

    if (rawUpdateData.gstNo !== undefined && rawUpdateData.gstNo !== null) {
      updateData.gstin = rawUpdateData.gstNo.trim() || null;
    }

    updateData.updatedByUserId = userId;

    const branch = await prisma.branch.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error("Branch update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.branch.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

    const [invoiceCount, poCount, grnCount, stockOutCount, stockAuditCount, indentCount, inventoryCount, piCount, vbmCount] =
      await Promise.all([
        prisma.invoice.count({ where: { branchId: id } }),
        prisma.purchaseOrder.count({ where: { branchId: id } }),
        prisma.goodsReceipt.count({ where: { branchId: id } }),
        prisma.stockOut.count({ where: { branchId: id } }),
        prisma.stockAudit.count({ where: { branchId: id } }),
        prisma.indent.count({ where: { branchId: id } }),
        prisma.inventoryLedger.count({ where: { branchId: id } }),
        prisma.purchaseInvoice.count({ where: { branchId: id } }),
        prisma.vendorBranchMapping.count({ where: { branchId: id } }),
      ]);

    if (invoiceCount > 0 || poCount > 0 || grnCount > 0 || stockOutCount > 0 || stockAuditCount > 0 || indentCount > 0 || inventoryCount > 0 || piCount > 0 || vbmCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this branch because it is referenced in invoices, purchase orders, goods receipts, stock entries, indents, inventory, purchase invoices, or vendor branch mappings.",
        },
        { status: 409 }
      );
    }

    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Branch delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
