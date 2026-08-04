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

function serializeCampaign(c: Record<string, unknown>): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    templateId: c.templateId,
    templateName: c.templateName,
    status: c.status,
    totalRecipients: c.totalRecipients,
    sentCount: c.sentCount,
    failedCount: c.failedCount,
    scheduledAt: c.scheduledAt ? formatDateTime(c.scheduledAt as Date) : null,
    sentAt: c.sentAt ? formatDateTime(c.sentAt as Date) : null,
    createdAt: c.createdAt,
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

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { templateName: { contains: search } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.wACampaign.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.wACampaign.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map(serializeCampaign),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("WhatsApp campaign list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { name, templateId, customerIds } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }
    if (!templateId) {
      return NextResponse.json({ error: "Template is required" }, { status: 400 });
    }
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 });
    }

    const template = await prisma.wATemplate.findFirst({
      where: { id: templateId, companyId },
    });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds }, companyId },
    });

    if (customers.length !== customerIds.length) {
      return NextResponse.json({ error: "Some customers not found" }, { status: 404 });
    }

    const campaign = await prisma.$transaction(async (tx) => {
      const created = await tx.wACampaign.create({
        data: {
          companyId,
          name: name.trim(),
          templateId,
          templateName: template.name,
          status: "DRAFT",
          totalRecipients: customerIds.length,
          sentCount: 0,
          failedCount: 0,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      });

      const items = customerIds.map((cid: number) => {
        const customer = customers.find((c) => c.id === cid);
        return {
          campaignId: created.id,
          customerId: cid,
          customerName: customer?.customerName || "",
          mobile: customer?.phone || "",
          status: "PENDING",
        };
      });

      await tx.wACampaignItem.createMany({ data: items });

      return created;
    });

    return NextResponse.json({ success: true, campaign: serializeCampaign(campaign) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("WhatsApp campaign create error:", error);
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

    const existing = await prisma.wACampaign.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.name !== undefined) {
      data.name = String(body.name).trim();
    }
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "SENT") {
        data.sentAt = new Date();
      }
    }
    if (body.scheduledAt !== undefined) {
      data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    }
    if (body.sentCount !== undefined) data.sentCount = body.sentCount;
    if (body.failedCount !== undefined) data.failedCount = body.failedCount;
    if (body.totalRecipients !== undefined) data.totalRecipients = body.totalRecipients;

    const updated = await prisma.wACampaign.update({ where: { id }, data });

    return NextResponse.json({ success: true, campaign: serializeCampaign(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("WhatsApp campaign update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.wACampaign.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    await prisma.wACampaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp campaign delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}