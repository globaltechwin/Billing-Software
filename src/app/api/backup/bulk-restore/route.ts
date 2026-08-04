import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";
import { runRestore, getBackupFilePath } from "@/lib/backup/backup-utils";

// POST — restore all companies from their latest backup (superadmin)
export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    if (ctx.userId !== 23) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { companyId } = body;

    let companies;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (!company) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
      companies = [company];
    } else {
      companies = await prisma.company.findMany({ where: { isActive: true } });
    }

    if (companies.length === 0) {
      return NextResponse.json({ error: "No active companies found" }, { status: 404 });
    }

    const results: { companyId: number; companyName: string; success: boolean; error?: string }[] = [];

    for (const company of companies) {
      try {
        const latestBackup = await prisma.backupHistory.findFirst({
          where: { companyId: company.id, status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
        });

        if (!latestBackup) {
          results.push({
            companyId: company.id,
            companyName: company.companyName,
            success: false,
            error: "No completed backup found",
          });
          continue;
        }

        const filePath = getBackupFilePath(company.id, latestBackup.fileName);
        await runRestore(company.id, ctx.userId, filePath, latestBackup.fileName);
        results.push({ companyId: company.id, companyName: company.companyName, success: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        results.push({ companyId: company.id, companyName: company.companyName, success: false, error: message });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      total: companies.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error("Bulk restore error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
