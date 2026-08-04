import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";

// GET /api/roles — list all roles
export async function GET() {
  try {
    await getCompanyContext();

    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { users: true } },
      },
    });

    const result = roles.map((r) => ({
      id: r.id,
      name: r.name,
      userCount: r._count.users,
    }));

    return NextResponse.json({ success: true, roles: result });
  } catch (error) {
    console.error("Roles list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
