import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateCashTransactionId } from "@/lib/number-generators";

function serializeTransaction(t: Record<string, unknown>): Record<string, unknown> {
  return {
    id: t.id,
    tranId: t.transactionId,
    tranDate: (t.transactionDate as Date).toLocaleDateString("en-IN"),
    tranType: t.transactionType,
    categoryName: (t.category as Record<string, unknown>)?.categoryName || "-",
    accountName: (t.account as Record<string, unknown>)?.accountName || "-",
    payMode: t.payMode,
    party: t.partyName || "-",
    refNo: t.referenceNo || "-",
    amount: Number(t.amount),
    remarks: t.remarks || "-",
    createdDate: (t.createdAt as Date).toLocaleDateString("en-IN"),
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const type = searchParams.get("type") || "All";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const where: Record<string, unknown> = { companyId };

    if (fromDate && toDate) {
      where.transactionDate = {
        gte: new Date(fromDate),
        lte: new Date(toDate + "T23:59:59"),
      };
    } else if (fromDate) {
      where.transactionDate = { gte: new Date(fromDate) };
    } else if (toDate) {
      where.transactionDate = { lte: new Date(toDate + "T23:59:59") };
    }

    if (type && type !== "All") where.transactionType = type;

    if (search) {
      where.OR = [
        { partyName: { contains: search } },
        { referenceNo: { contains: search } },
        { remarks: { contains: search } },
        { transactionId: { contains: search } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.cashTransaction.findMany({
        where,
        include: {
          category: { select: { categoryName: true } },
          account: { select: { accountName: true } },
        },
        orderBy: [{ transactionDate: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashTransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      transactions: transactions.map(serializeTransaction),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Cash transaction list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { transactionType, transactionDate, categoryId, accountId, payMode, amount, partyName, referenceNo, remarks } = body;

    if (!transactionType) {
      return NextResponse.json({ error: "Transaction Type is required" }, { status: 400 });
    }
    if (!transactionDate) {
      return NextResponse.json({ error: "Transaction Date is required" }, { status: 400 });
    }
    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return NextResponse.json({ error: "Amount is required and must be greater than 0" }, { status: 400 });
    }

    const transactionId = await generateCashTransactionId(companyId);

    const transaction = await prisma.cashTransaction.create({
      data: {
        companyId,
        transactionId,
        transactionDate: new Date(transactionDate),
        transactionType,
        categoryId: categoryId ? Number(categoryId) : null,
        accountId: accountId ? Number(accountId) : null,
        payMode: payMode || "Cash",
        amount: Number(amount),
        partyName: partyName || null,
        referenceNo: referenceNo || null,
        remarks: remarks || null,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      include: {
        category: { select: { categoryName: true } },
        account: { select: { accountName: true } },
      },
    });

    return NextResponse.json({ success: true, transaction: serializeTransaction(transaction) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Cash transaction create error:", error);
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

    const existing = await prisma.cashTransaction.findFirst({
      where: { id, companyId },
      include: { category: true, account: true },
    });
    if (!existing) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.transactionType !== undefined) data.transactionType = body.transactionType;
    if (body.transactionDate !== undefined) data.transactionDate = new Date(body.transactionDate);
    if (body.categoryId !== undefined) data.categoryId = body.categoryId ? Number(body.categoryId) : null;
    if (body.accountId !== undefined) data.accountId = body.accountId ? Number(body.accountId) : null;
    if (body.payMode !== undefined) data.payMode = body.payMode;
    if (body.amount !== undefined) data.amount = Number(body.amount);
    if (body.partyName !== undefined) data.partyName = body.partyName || null;
    if (body.referenceNo !== undefined) data.referenceNo = body.referenceNo || null;
    if (body.remarks !== undefined) data.remarks = body.remarks || null;

    const updated = await prisma.cashTransaction.update({ where: { id }, data });

    return NextResponse.json({ success: true, transaction: serializeTransaction(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Cash transaction update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.cashTransaction.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    await prisma.cashTransaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cash transaction delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}