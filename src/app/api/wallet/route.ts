import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const payMode = searchParams.get("payMode");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Single customer wallet balance
    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: parseInt(customerId), companyId },
        select: { id: true, wallet: true, customerName: true },
      });
      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        wallet: { customerId: customer.id, balance: customer.wallet.toString(), customerName: customer.customerName },
      });
    }

    // Transaction list for reports
    const where: Record<string, unknown> = { companyId };

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate + "T00:00:00") : undefined;
      const end = endDate ? new Date(endDate + "T23:59:59") : undefined;
      where.createdAt = {};
      if (start) (where.createdAt as Record<string, Date>).gte = start;
      if (end) (where.createdAt as Record<string, Date>).lte = end;
    }

    if (payMode && payMode !== "All") where.paymentMode = payMode;

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { employeeId: { contains: search } },
        { cardNumber: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const allowedSortFields = ["id", "amount", "paymentMode", "createdAt"];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    const result = transactions.map((t, i) => ({
      id: t.id,
      sNo: (page - 1) * limit + i + 1,
      employeeName: t.customerName,
      employeeId: t.employeeId,
      cardNumber: t.cardNumber,
      mobile: t.mobile,
      department: "",
      amount: t.amount.toString(),
      paymode: t.paymentMode,
      createdBy: "",
      date: t.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      transactionDate: t.createdAt.toISOString(),
      status: t.status,
      transactionType: t.transactionType,
    }));

    return NextResponse.json({
      success: true,
      transactions: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Wallet list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();

    const { customerId, amount: rawAmount, paymentMode, cardNumber, employeeId, customerName, mobile } = body;
    const amount = parseFloat(rawAmount);

    if (!customerId) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    if (!paymentMode || paymentMode === "-- Payment Mode --") {
      return NextResponse.json({ error: "Payment mode is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: { wallet: { increment: amount } },
        select: { id: true, wallet: true },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          companyId,
          customerId,
          cardNumber: cardNumber || customer.customerCode || null,
          employeeId: employeeId || customer.customerCode || null,
          customerName: customerName || customer.customerName,
          mobile: mobile || customer.phone,
          amount,
          paymentMode,
          status: "Completed",
          transactionType: "TOP_UP",
          createdByUserId: userId,
        },
      });

      return { customer: updatedCustomer, transaction };
    });

    return NextResponse.json(
      {
        success: true,
        wallet: {
          customerId: result.customer.id,
          balance: result.customer.wallet.toString(),
        },
        transaction: {
          id: result.transaction.id,
          cardNumber: result.transaction.cardNumber,
          employeeId: result.transaction.employeeId,
          customerName: result.transaction.customerName,
          mobile: result.transaction.mobile,
          amount: result.transaction.amount.toString(),
          paymentMode: result.transaction.paymentMode,
          transactionDate: result.transaction.createdAt.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
          status: result.transaction.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Wallet top-up error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
