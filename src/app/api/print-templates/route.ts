import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const templates = await prisma.printTemplate.findMany({
      where: { companyId },
      include: { fields: { orderBy: { displayOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Print template list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { templateName, templateType, useDynamicPrint, showLogo, logoUrl, logoSize, logoAlignment, footerMessage, fields } = body;

    if (!templateName) {
      return NextResponse.json({ error: "templateName is required" }, { status: 400 });
    }

    const template = await prisma.$transaction(async (tx) => {
      if (body.isDefault) {
        await tx.printTemplate.updateMany({
          where: { companyId, templateType: templateType || "BILL" },
          data: { isDefault: false },
        });
      }

      const tmpl = await tx.printTemplate.create({
        data: {
          companyId,
          templateName,
          templateType: templateType || "BILL",
          isDefault: body.isDefault || false,
          useDynamicPrint: useDynamicPrint !== false,
          showLogo: showLogo || false,
          logoUrl: logoUrl || null,
          logoSize: logoSize || "MEDIUM",
          logoAlignment: logoAlignment || "CENTER",
          footerMessage: footerMessage || "Thank you. Visit again.",
        },
      });

      if (fields && fields.length > 0) {
        await tx.printTemplateField.createMany({
          data: fields.map((f: Record<string, unknown>, i: number) => ({
            templateId: tmpl.id,
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

      return tmpl;
    });

    const result = await prisma.printTemplate.findUnique({
      where: { id: template.id },
      include: { fields: { orderBy: { displayOrder: "asc" } } },
    });

    return NextResponse.json({ success: true, template: result }, { status: 201 });
  } catch (error) {
    console.error("Print template creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
