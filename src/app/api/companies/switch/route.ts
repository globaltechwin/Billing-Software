import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie, getSession, shouldSecureCookie } from "@/lib/auth";

// POST /api/companies/switch — switch active company
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: session.userId,
          companyId: parseInt(companyId, 10),
        },
      },
      include: {
        company: true,
      },
    });

    if (!userCompany) {
      return NextResponse.json(
        { error: "You do not have access to this company" },
        { status: 403 }
      );
    }

    // Update user's default company
    await prisma.user.update({
      where: { id: session.userId },
      data: { defaultCompanyId: userCompany.companyId },
    });

    // Issue new token with updated companyId
    const token = await signToken({
      userId: session.userId,
      username: session.username,
      companyId: userCompany.companyId,
    });

    await setAuthCookie(token, shouldSecureCookie(request));

    return NextResponse.json({
      success: true,
      token,
      company: {
        id: userCompany.companyId,
        companyName: userCompany.company.companyName,
      },
    });
  } catch (error) {
    console.error("Company switch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
