import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateQuoteNumber } from "@/lib/number-generators";

function serializeQuote(q: Record<string, unknown>): Record<string, unknown> {
  const items = (q.items as Record<string, unknown>[] || []).map((item) => ({
    id: item.id,
    item: item.item,
    description: item.description || "",
    hsn: item.hsn || "",
    qty: Number(item.quantity),
    rate: Number(item.unitPrice),
    amount: Number(item.amount),
  }));

  return {
    id: q.id,
    quoteNo: q.quoteNumber,
    customer: q.customerName,
    date: q.quoteDate ? (q.quoteDate as Date).toLocaleDateString("en-IN") : "",
    expiryDate: q.expiryDate ? (q.expiryDate as Date).toLocaleDateString("en-IN") : "",
    status: q.status,
    items,
    discount: Number(q.discount),
    discountType: q.discountType || "%",
    taxRate: Number(q.taxRate),
    notes: q.notes || "",
    terms: q.terms || "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const where: Record<string, unknown> = { companyId };

    if (status && status !== "All") where.status = status;
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search } },
        { customerName: { contains: search } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      quotes: quotes.map(serializeQuote),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Quote list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { customerName, status, quoteDate, expiryDate, discount, discountType, taxRate, notes, terms, items } = body;

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const quoteNumber = await generateQuoteNumber(companyId);

    const quote = await prisma.quote.create({
      data: {
        companyId,
        quoteNumber,
        customerName: customerName.trim(),
        status,
        quoteDate: quoteDate ? new Date(quoteDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        discount: Number(discount) || 0,
        discountType: discountType === "₹" ? "₹" : "%",
        taxRate: Number(taxRate) || 0,
        notes: notes || null,
        terms: terms || null,
        createdByUserId: userId,
        updatedByUserId: userId,
        items: {
          create: (items || []).map((item: Record<string, unknown>) => ({
            item: item.item || "",
            description: item.description || null,
            hsn: item.hsn || null,
            quantity: Number(item.qty) || 0,
            unitPrice: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, quote: serializeQuote(quote) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Quote create error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const id = parseInt(String(body.id), 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.quote.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.customerName !== undefined) data.customerName = String(body.customerName).trim();
    if (body.status !== undefined) data.status = body.status;
    if (body.quoteDate !== undefined) data.quoteDate = body.quoteDate ? new Date(body.quoteDate) : null;
    if (body.expiryDate !== undefined) data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    if (body.discount !== undefined) data.discount = Number(body.discount);
    if (body.discountType !== undefined) data.discountType = body.discountType === "₹" ? "₹" : "%";
    if (body.taxRate !== undefined) data.taxRate = Number(body.taxRate);
    if (body.notes !== undefined) data.notes = body.notes || null;
    if (body.terms !== undefined) data.terms = body.terms || null;

    if (body.items !== undefined) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
      await prisma.quoteItem.createMany({
        data: (body.items as Record<string, unknown>[]).map((item) => ({
          quoteId: id,
          item: String(item.item ?? ""),
          description: item.description ? String(item.description) : null,
          hsn: item.hsn ? String(item.hsn) : null,
          quantity: Number(item.qty) || 0,
          unitPrice: Number(item.rate) || 0,
          amount: Number(item.amount) || 0,
        })),
      });
    }

    const updated = await prisma.quote.update({ where: { id }, data, include: { items: true } });

    return NextResponse.json({ success: true, quote: serializeQuote(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Quote update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.quote.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    await prisma.quote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}