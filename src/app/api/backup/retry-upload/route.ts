import { NextResponse } from "next/server";
import { getCompanyContext, isAdmin } from "@/lib/company-context";
import { retryCloudUpload } from "@/lib/backup/backup-utils";

export async function POST() {
  try {
    const ctx = await getCompanyContext();

    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await retryCloudUpload(ctx.companyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Retry failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
