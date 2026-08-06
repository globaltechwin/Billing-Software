import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";
import { flattenMenuPaths } from "@/lib/menu-config";

// GET — fetch menu access for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");
    const companyId = parseInt(searchParams.get("companyId") || "0");

    if (!userId || !companyId) {
      return NextResponse.json({ error: "userId and companyId required" }, { status: 400 });
    }

    const existing = await prisma.userMenuAccess.findMany({
      where: { userId, companyId },
      select: { menuPath: true, allowed: true },
    });

    const allPaths = flattenMenuPaths();
    const blockedPaths = new Set(existing.filter((e) => !e.allowed).map((e) => e.menuPath));
    const explicitlyAllowed = new Set(existing.filter((e) => e.allowed).map((e) => e.menuPath));

    const menuState = allPaths.map((path) => ({
      path,
      allowed: explicitlyAllowed.has(path) || !blockedPaths.has(path),
    }));

    return NextResponse.json({ success: true, menuState });
  } catch (error) {
    console.error("GET user-menu-access error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — save menu access for a user (superadmin or admin of that company)
export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    const body = await request.json();
    const { userId, companyId, blockedPaths } = body as {
      userId: number;
      companyId: number;
      blockedPaths: string[];
    };

    if (!userId || !companyId || !Array.isArray(blockedPaths)) {
      return NextResponse.json({ error: "userId, companyId, blockedPaths[] required" }, { status: 400 });
    }

    // Caller must be Owner or Admin in any of their companies
    const callerCompanyRoles = await prisma.userCompany.findMany({
      where: { userId: ctx.userId },
      include: { role: { select: { name: true } } },
    });
    const isCallerPrivileged = callerCompanyRoles.some(
      (uc) => ["Owner", "Admin"].includes(uc.role.name)
    );
    if (!isCallerPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete existing records for this user+company
    await prisma.userMenuAccess.deleteMany({
      where: { userId, companyId },
    });

    // Only insert blocked paths (everything not listed is allowed by default)
    if (blockedPaths.length > 0) {
      await prisma.userMenuAccess.createMany({
        data: blockedPaths.map((menuPath) => ({
          userId,
          companyId,
          menuPath,
          allowed: false,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST user-menu-access error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — reset all menu access (all menus allowed)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");
    const companyId = parseInt(searchParams.get("companyId") || "0");

    if (!userId || !companyId) {
      return NextResponse.json({ error: "userId and companyId required" }, { status: 400 });
    }

    await prisma.userMenuAccess.deleteMany({
      where: { userId, companyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE user-menu-access error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
