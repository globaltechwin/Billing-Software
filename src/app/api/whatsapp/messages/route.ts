import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

function formatDateTime(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const where: Record<string, unknown> = { companyId };

    if (status) where.status = status;
    if (fromDate) where.sentAt = { ...((where.sentAt as Record<string, Date>) || {}), gte: new Date(`${fromDate}T00:00:00.000Z`) };
    if (toDate) where.sentAt = { ...((where.sentAt as Record<string, Date>) || {}), lte: new Date(`${toDate}T23:59:59.999Z`) };

    if (search) {
      where.OR = [
        { billNo: { contains: search } },
        { mobile: { contains: search } },
        { customer: { contains: search } },
        { error: { contains: search } },
        { templateName: { contains: search } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.wAMessage.findMany({
        where,
        orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.wAMessage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({
        id: m.id,
        billNo: m.billNo || "",
        mobile: m.mobile || "",
        customer: m.customer || "",
        status: m.status,
        cost: Number(m.cost),
        sentAt: m.sentAt ? formatDateTime(m.sentAt) : "",
        error: m.error || "",
        templateName: m.templateName || "",
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("WhatsApp messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { billNo, mobile, customer, templateName } = body;

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    const message = await prisma.wAMessage.create({
      data: {
        companyId,
        billNo: billNo || null,
        mobile,
        customer: customer || null,
        templateName: templateName || null,
        status: "PENDING",
        cost: 0,
        createdByUserId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        billNo: message.billNo || "",
        mobile: message.mobile || "",
        customer: message.customer || "",
        status: message.status,
        cost: Number(message.cost),
        sentAt: "",
        error: "",
        templateName: message.templateName || "",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}