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

function serializeTemplate(t: Record<string, unknown>): Record<string, unknown> {
  return {
    id: t.id,
    name: t.name,
    isDefault: t.isDefault,
    language: t.language === "en_US" ? "English US" : t.language,
    category: t.category,
    header: t.header || "",
    body: t.body,
    footer: t.footer || "",
    params: t.params,
    status: t.status,
    lastSync: t.lastSyncAt ? formatDateTime(t.lastSyncAt as Date) : "-",
    sampleValues: JSON.parse((t.sampleValues as string) || "[]") as string[],
    paramLabels: JSON.parse((t.paramLabels as string) || "[]") as string[],
    createdAt: t.createdAt,
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
        { language: { contains: search } },
        { category: { contains: search } },
        { status: { contains: search } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.wATemplate.findMany({
        where,
        include: {
          createdByUser: { select: { id: true, name: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.wATemplate.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      templates: templates.map(serializeTemplate),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("WhatsApp template list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { name, language, isDefault, category, header, body: bodyText, footer, sampleValues, paramLabels } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }
    if (!bodyText || !bodyText.trim()) {
      return NextResponse.json({ error: "Template body is required" }, { status: 400 });
    }

    const existing = await prisma.wATemplate.findFirst({ where: { companyId, name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Template name already exists" }, { status: 409 });
    }

    const params = (bodyText.match(/\{\{\d+\}\}/g) || []).length;

    const template = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.wATemplate.updateMany({
          where: { companyId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const created = await tx.wATemplate.create({
        data: {
          companyId,
          name: name.trim(),
          language: language || "en_US",
          isDefault: !!isDefault,
          category: category || "UTILITY — transactional (bills, receipts, alerts)",
          header: header || null,
          body: bodyText,
          footer: footer || null,
          params,
          status: "DRAFT",
          sampleValues: JSON.stringify(sampleValues || []),
          paramLabels: JSON.stringify(paramLabels || []),
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      });
      return created;
    });

    return NextResponse.json({ success: true, template: serializeTemplate(template) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Template name already exists") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error("WhatsApp template create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const id = parseInt(String(body.id), 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.wATemplate.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ error: "Template name is required" }, { status: 400 });
      const dup = await prisma.wATemplate.findFirst({
        where: { companyId, name, id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "Template name already exists" }, { status: 409 });
      data.name = name;
    }
    if (body.language !== undefined) data.language = body.language === "English US" ? "en_US" : body.language;
    if (body.isDefault !== undefined) {
      if (body.isDefault) {
        await prisma.wATemplate.updateMany({
          where: { companyId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
      data.isDefault = body.isDefault;
    }
    if (body.category !== undefined) data.category = body.category;
    if (body.header !== undefined) data.header = body.header || null;
    if (body.body !== undefined) {
      data.body = body.body;
      data.params = (body.body.match(/\{\{\d+\}\}/g) || []).length;
    }
    if (body.footer !== undefined) data.footer = body.footer || null;
    if (body.status !== undefined) data.status = body.status;
    if (body.sampleValues !== undefined) data.sampleValues = JSON.stringify(body.sampleValues || []);
    if (body.paramLabels !== undefined) data.paramLabels = JSON.stringify(body.paramLabels || []);

    const updated = await prisma.wATemplate.update({ where: { id }, data });

    return NextResponse.json({ success: true, template: serializeTemplate(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Template name already exists" || message === "Template not found") {
      return NextResponse.json({ error: message }, { status: message === "Template not found" ? 404 : 409 });
    }
    console.error("WhatsApp template update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.wATemplate.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    await prisma.wATemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp template delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}