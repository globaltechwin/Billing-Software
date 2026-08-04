import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function GET() {
  try {
    const ctx = await getCompanyContext();

    // Only superadmin (userId 23) can see all companies
    if (ctx.userId !== 23) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
        shortCode: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const companyData = await Promise.all(
      companies.map(async (c) => {
        const [backupCount, backups, backupSetting, latestBackup] = await Promise.all([
          prisma.backupHistory.count({ where: { companyId: c.id } }),
          prisma.backupHistory.findMany({
            where: { companyId: c.id },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              backupName: true,
              fileName: true,
              fileSize: true,
              uploadStatus: true,
              storageType: true,
              cloudPath: true,
              createdAt: true,
            },
          }),
          prisma.backupSetting.findUnique({ where: { companyId: c.id } }),
          prisma.backupHistory.findFirst({
            where: { companyId: c.id, status: "COMPLETED" },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          }),
        ]);

        const totalSize = backups.reduce((acc, b) => acc + (b.fileSize || 0), 0);

        return {
          companyId: c.id,
          companyName: c.companyName,
          shortCode: c.shortCode || "",
          isActive: c.isActive,
          totalBackups: backupCount,
          totalSizeFormatted: formatBytes(totalSize),
          cloudEnabled: backupSetting?.cloudBackupEnabled ?? false,
          latestBackupDate: latestBackup?.createdAt?.toISOString() || null,
          backups: backups.map((b) => ({
            id: b.id,
            backupName: b.backupName,
            fileName: b.fileName,
            fileSize: b.fileSize,
            fileSizeFormatted: formatBytes(b.fileSize || 0),
            status: b.uploadStatus,
            storageType: b.storageType || "local",
            cloudPath: b.cloudPath,
            createdAt: b.createdAt.toISOString(),
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      companies: companyData,
      totalCompanies: companies.length,
    });
  } catch (error) {
    console.error("Companies backup status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
