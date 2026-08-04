import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    const template = await prisma.printTemplate.findFirst({
      where: { id: templateId, companyId },
      include: { fields: { orderBy: { displayOrder: "asc" } } },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Print template detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    const existing = await prisma.printTemplate.findFirst({
      where: { id: templateId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const { templateName, templateType, useDynamicPrint, showLogo, logoUrl, logoSize, logoAlignment, footerMessage, isDefault, fields } = body;

    const template = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.printTemplate.updateMany({
          where: { companyId, templateType: templateType || existing.templateType, id: { not: templateId } },
          data: { isDefault: false },
        });
      }

      const tmpl = await tx.printTemplate.update({
        where: { id: templateId },
        data: {
          templateName: templateName ?? existing.templateName,
          templateType: templateType ?? existing.templateType,
          useDynamicPrint: useDynamicPrint ?? existing.useDynamicPrint,
          showLogo: showLogo ?? existing.showLogo,
          logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
          logoSize: logoSize ?? existing.logoSize,
          logoAlignment: logoAlignment ?? existing.logoAlignment,
          footerMessage: footerMessage !== undefined ? footerMessage : existing.footerMessage,
          isDefault: isDefault ?? existing.isDefault,
        },
      });

      if (fields) {
        await tx.printTemplateField.deleteMany({ where: { templateId } });
        if (fields.length > 0) {
          await tx.printTemplateField.createMany({
            data: fields.map((f: Record<string, unknown>, i: number) => ({
              templateId,
              fieldKey: f.fieldKey,
              label: f.label,
              visible: f.visible !== false,
              bold: f.bold || false,
              fontSize: f.fontSize || 10,
              alignment: f.alignment || "LEFT",
              displayOrder: f.displayOrder ?? i,
            })),
          });
        }
      }

      return tmpl;
    });

    const result = await prisma.printTemplate.findUnique({
      where: { id: templateId },
      include: { fields: { orderBy: { displayOrder: "asc" } } },
    });

    return NextResponse.json({ success: true, template: result });
  } catch (error) {
    console.error("Print template update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    const existing = await prisma.printTemplate.findFirst({
      where: { id: templateId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await prisma.printTemplate.delete({ where: { id: templateId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Print template delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
