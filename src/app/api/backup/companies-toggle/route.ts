import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";

// PATCH — toggle cloud backup for a specific company
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    if (ctx.userId !== 23) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { companyId, cloudBackupEnabled } = body;

    if (!companyId || typeof cloudBackupEnabled !== "boolean") {
      return NextResponse.json({ error: "companyId and cloudBackupEnabled are required" }, { status: 400 });
    }

    await prisma.backupSetting.upsert({
      where: { companyId },
      create: {
        companyId,
        cloudBackupEnabled,
        autoBackupEnabled: false,
        backupTime: "02:00",
        retentionDays: 30,
        maxBackupCount: 50,
        compression: true,
        encryption: false,
      },
      update: { cloudBackupEnabled },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle cloud backup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
