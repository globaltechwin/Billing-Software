import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";
import { flattenMenuPaths } from "@/lib/menu-config";

// GET — return the current user's allowed menu paths (for sidebar)
export async function GET() {
  try {
    const ctx = await getCompanyContext();

    const menuAccess = await prisma.userMenuAccess.findMany({
      where: { userId: ctx.userId, companyId: ctx.companyId },
      select: { menuPath: true, allowed: true },
    });

    let allowedPaths: string[] | null = null;

    if (menuAccess.length > 0) {
      const allPaths = flattenMenuPaths();
      const blockedPaths = new Set(
        menuAccess.filter((m) => !m.allowed).map((m) => m.menuPath),
      );
      const explicitlyAllowed = new Set(
        menuAccess.filter((m) => m.allowed).map((m) => m.menuPath),
      );
      allowedPaths = allPaths.filter(
        (p) => explicitlyAllowed.has(p) || !blockedPaths.has(p),
      );
    }

    return NextResponse.json({
      success: true,
      allowedMenuPaths: allowedPaths,
    });
  } catch (error) {
    console.error("GET my-menu-access error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
