import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

const ALLOWED_SORT_FIELDS = [
  "id",
  "customerCode",
  "customerName",
  "phone",
  "gstNumber",
  "city",
  "creditLimit",
  "isActive",
  "createdAt",
];

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, "");
}

async function generateCustomerCode(companyId: number): Promise<string> {
  const customers = await prisma.customer.findMany({
    where: { companyId, customerCode: { not: null } },
    select: { customerCode: true },
  });

  let max = 0;
  for (const c of customers) {
    const match = (c.customerCode || "").match(/(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }

  return `CUS-${String(max + 1).padStart(4, "0")}`;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const customerName = searchParams.get("customerName");
    const customerCode = searchParams.get("customerCode");
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
    if (customerName) where.customerName = { contains: customerName };
    if (customerCode) where.customerCode = { contains: customerCode };
    if (mobile) where.phone = { contains: mobile };
    if (city) where.city = { contains: city };

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerCode: { contains: search } },
        { phone: { contains: search } },
        { alternatePhone: { contains: search } },
        { email: { contains: search } },
        { gstNumber: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const orderField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [customers, total, invoiceTotals, paymentTotals] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
      prisma.invoice.groupBy({
        by: ["customerId"],
        where: { companyId, customerId: { not: null }, deletedAt: null },
        _sum: { grandTotal: true },
      }),
      prisma.invoicePayment.groupBy({
        by: ["customerId"],
        where: { companyId, customerId: { not: null } },
        _sum: { amount: true },
      }),
    ]);

    const invoiceMap = new Map<number, number>();
    for (const row of invoiceTotals) {
      if (row.customerId !== null) {
        invoiceMap.set(row.customerId, Number(row._sum.grandTotal) || 0);
      }
    }
    const paymentMap = new Map<number, number>();
    for (const row of paymentTotals) {
      if (row.customerId !== null) {
        paymentMap.set(row.customerId, Number(row._sum.amount) || 0);
      }
    }

    const result = customers.map((c) => {
      const invoiced = invoiceMap.get(c.id) || 0;
      const paid = paymentMap.get(c.id) || 0;
      return {
        ...c,
        creditLimit: c.creditLimit.toString(),
        outstandingBalance: Math.max(0, invoiced - paid),
      };
    });

    return NextResponse.json({
      success: true,
      customers: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Customer list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();

    const customerName = body.customerName?.trim();
    const phone = normalizePhone(body.phone || "");

    if (!customerName) {
      return NextResponse.json({ error: "Customer Name is required" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Mobile Number is required" }, { status: 400 });
    }

    const duplicatePhone = await prisma.customer.findFirst({
      where: { companyId, phone },
    });
    if (duplicatePhone) {
      if (phone === "0000000000") {
        return NextResponse.json({ success: true, customer: duplicatePhone });
      }
      return NextResponse.json(
        { error: "A customer with this mobile number already exists" },
        { status: 409 }
      );
    }

    if (body.gstNumber) {
      const duplicateGst = await prisma.customer.findFirst({
        where: { companyId, gstNumber: body.gstNumber.trim() },
      });
      if (duplicateGst) {
        return NextResponse.json(
          { error: "A customer with this GSTIN already exists" },
          { status: 409 }
        );
      }
    }

    const customerCode = await generateCustomerCode(companyId);

    const customer = await prisma.customer.create({
      data: {
        companyId,
        customerCode,
        customerName,
        phone,
        alternatePhone: body.alternatePhone?.trim() || null,
        email: body.email?.trim() || null,
        gstNumber: body.gstNumber?.trim() || null,
        panNumber: body.panNumber?.trim() || null,
        address: body.address?.trim() || null,
        addressLine2: body.addressLine2?.trim() || null,
        city: body.city?.trim() || null,
        stateName: body.stateName?.trim() || "Tamil Nadu",
        stateCode: body.stateCode?.trim() || "33",
        country: body.country?.trim() || "India",
        pincode: body.pincode?.trim() || null,
        customerType: body.customerType || "INDIVIDUAL",
        creditLimit: parseFloat(body.creditLimit) || 0,
        creditDays: parseInt(body.creditDays, 10) || 0,
        priceList: body.priceList?.trim() || null,
        remarks: body.remarks?.trim() || null,
        isActive: body.isActive !== false,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        customer: { ...customer, creditLimit: customer.creditLimit.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer creation error:", error);
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

    const existing = await prisma.customer.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    if (updateData.phone) {
      const phone = normalizePhone(updateData.phone);
      const duplicatePhone = await prisma.customer.findFirst({
        where: { companyId, phone, id: { not: id } },
      });
      if (duplicatePhone) {
        return NextResponse.json(
          { error: "A customer with this mobile number already exists" },
          { status: 409 }
        );
      }
      updateData.phone = phone;
    }

    if (updateData.gstNumber) {
      const gstNumber = updateData.gstNumber.trim();
      const duplicateGst = await prisma.customer.findFirst({
        where: { companyId, gstNumber, id: { not: id } },
      });
      if (duplicateGst) {
        return NextResponse.json(
          { error: "A customer with this GSTIN already exists" },
          { status: 409 }
        );
      }
      updateData.gstNumber = gstNumber;
    }

    if (updateData.creditLimit !== undefined) updateData.creditLimit = parseFloat(updateData.creditLimit) || 0;
    if (updateData.creditDays !== undefined) updateData.creditDays = parseInt(updateData.creditDays, 10) || 0;
    updateData.updatedByUserId = userId;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      customer: { ...customer, creditLimit: customer.creditLimit.toString() },
    });
  } catch (error) {
    console.error("Customer update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.customer.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const [invoiceCount, estimateCount, paymentCount] = await Promise.all([
      prisma.invoice.count({ where: { customerId: id } }),
      prisma.estimate.count({ where: { customerId: id } }),
      prisma.invoicePayment.count({ where: { customerId: id } }),
    ]);

    if (invoiceCount > 0 || estimateCount > 0 || paymentCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this customer because they have associated invoices, estimates, or credit settlements.",
        },
        { status: 409 }
      );
    }

    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
