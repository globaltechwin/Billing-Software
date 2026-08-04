import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    if (!searchParams.get("startDate") || !searchParams.get("endDate")) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    return NextResponse.json({ success: true, rows: [] });
  } catch (error) {
    console.error("Bill coupon report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
