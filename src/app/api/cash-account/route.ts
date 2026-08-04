import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateCashAccountId } from "@/lib/number-generators";

function serializeAccount(a: Record<string, unknown>): Record<string, unknown> {
  return {
    id: a.id,
    accountId: a.accountId,
    accountName: a.accountName,
    accountType: a.accountType,
    openingBalance: Number(a.openingBalance),
    status: (a.isActive as boolean) ? "Active" : "Inactive",
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const where: Record<string, unknown> = { companyId };

    if (search) {
      where.OR = [
        { accountName: { contains: search } },
        { accountId: { contains: search } },
        { accountType: { contains: search } },
      ];
    }

    const [accounts, total] = await Promise.all([
      prisma.cashAccount.findMany({
        where,
        orderBy: [{ id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashAccount.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      accounts: accounts.map(serializeAccount),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Cash account list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { accountName, accountType, openingBalance } = body;

    if (!accountName || !accountName.trim()) {
      return NextResponse.json({ error: "Account Name is required" }, { status: 400 });
    }
    if (!accountType) {
      return NextResponse.json({ error: "Account Type is required" }, { status: 400 });
    }

    const accountId = await generateCashAccountId(companyId);

    const account = await prisma.cashAccount.create({
      data: {
        companyId,
        accountId,
        accountName: accountName.trim(),
        accountType,
        openingBalance: Number(openingBalance) || 0,
        isActive: true,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });

    return NextResponse.json({ success: true, account: serializeAccount(account) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Cash account create error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const id = parseInt(String(body.id), 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.cashAccount.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.accountName !== undefined) data.accountName = String(body.accountName).trim();
    if (body.accountType !== undefined) data.accountType = body.accountType;
    if (body.openingBalance !== undefined) data.openingBalance = Number(body.openingBalance);
    if (body.status !== undefined) data.isActive = body.status === "Active";

    const updated = await prisma.cashAccount.update({ where: { id }, data });

    return NextResponse.json({ success: true, account: serializeAccount(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Cash account update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.cashAccount.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    await prisma.cashAccount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cash account delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}