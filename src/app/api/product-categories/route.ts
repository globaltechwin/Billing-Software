import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

function errorResponse(error: unknown) {
  console.error("Product categories API error:", error);
  return NextResponse.json({ error: "Unable to process product categories. Please try again." }, { status: 500 });
}

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    // GET must remain read-only. Do not import legacy categories here: concurrent
    // page requests can race and cause Prisma P2034 write conflicts.
    const categories = await prisma.productCategory.findMany({
      where: { companyId },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
    if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    if (name.length > 100) return NextResponse.json({ error: "Category name must be 100 characters or fewer." }, { status: 400 });
    const duplicate = await prisma.productCategory.findFirst({ where: { companyId, name: { equals: name } } });
    if (duplicate) return NextResponse.json({ error: "This category already exists for the current company." }, { status: 409 });
    const category = await prisma.productCategory.create({ data: { companyId, name }, select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true } });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") return NextResponse.json({ error: "This category already exists for the current company." }, { status: 409 });
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "A valid category ID is required." }, { status: 400 });
    const existing = await prisma.productCategory.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Category not found for this company." }, { status: 404 });
    const data: { name?: string; isActive?: boolean } = {};
    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
      if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
      if (name.length > 100) return NextResponse.json({ error: "Category name must be 100 characters or fewer." }, { status: 400 });
      const duplicate = await prisma.productCategory.findFirst({ where: { companyId, name, NOT: { id } } });
      if (duplicate) return NextResponse.json({ error: "This category already exists for the current company." }, { status: 409 });
      data.name = name;
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (!Object.keys(data).length) return NextResponse.json({ error: "No valid changes were provided." }, { status: 400 });
    const category = await prisma.productCategory.update({ where: { id }, data, select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true } });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") return NextResponse.json({ error: "This category already exists for the current company." }, { status: 409 });
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "A valid category ID is required." }, { status: 400 });
    const category = await prisma.productCategory.findFirst({ where: { id, companyId } });
    if (!category) return NextResponse.json({ error: "Category not found for this company." }, { status: 404 });
    const used = await prisma.product.count({ where: { companyId, category: category.name } });
    if (used > 0) return NextResponse.json({ error: `This category is assigned to ${used} product(s). Deactivate it instead to preserve product history.` }, { status: 409 });
    await prisma.productCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) { return errorResponse(error); }
}
