import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();

    let balance = await prisma.wABalance.findUnique({
      where: { companyId },
    });

    if (!balance) {
      balance = await prisma.wABalance.create({
        data: {
          companyId,
          currentBalance: 10000,
          costPerMessage: 0.5,
        },
      });
    }

    const [totalSpent, totalRecharged, messageCount] = await Promise.all([
      prisma.wABalanceTransaction.aggregate({
        where: { companyId, type: "DEDUCT" },
        _sum: { amount: true },
      }),
      prisma.wABalanceTransaction.aggregate({
        where: { companyId, type: "RECHARGE" },
        _sum: { amount: true },
      }),
      prisma.wAMessage.count({ where: { companyId } }),
    ]);

    return NextResponse.json({
      success: true,
      balance: {
        currentBalance: Number(balance.currentBalance),
        totalSpent: Number(totalSpent._sum.amount || 0),
        totalRecharged: Number(totalRecharged._sum.amount || 0),
        costPerMessage: Number(balance.costPerMessage),
        messagesRemaining: Math.floor(Number(balance.currentBalance) / Number(balance.costPerMessage)),
        totalMessages: messageCount,
      },
    });
  } catch (error) {
    console.error("WhatsApp balance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const balance = await prisma.wABalance.upsert({
      where: { companyId },
      create: { companyId, currentBalance: 0, costPerMessage: 0.5 },
      update: {},
    });

    await prisma.$transaction(async (tx) => {
      await tx.wABalance.update({
        where: { id: balance.id },
        data: {
          currentBalance: { increment: Number(amount) },
          totalRecharged: { increment: Number(amount) },
          updatedAt: new Date(),
        },
      });

      await tx.wABalanceTransaction.create({
        data: {
          companyId,
          type: "RECHARGE",
          amount: Number(amount),
          description: description || "Balance recharge",
        },
      });
    });

    const updated = await prisma.wABalance.findUnique({ where: { id: balance.id } });

    return NextResponse.json({
      success: true,
      balance: {
        currentBalance: Number(updated!.currentBalance),
        totalSpent: Number(updated!.totalSpent),
        totalRecharged: Number(updated!.totalRecharged),
        costPerMessage: Number(updated!.costPerMessage),
        messagesRemaining: Math.floor(Number(updated!.currentBalance) / Number(updated!.costPerMessage)),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("WhatsApp recharge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}