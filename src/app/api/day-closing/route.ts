import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isValidBusinessDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && toISODate(d) === value;
}

function toBusinessDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
  return value;
}

async function resolveDefaultBranch(companyId: number) {
  const preferred = await prisma.branch.findFirst({
    where: { companyId, isDefault: true, isActive: true },
  });
  if (preferred) return preferred;
  return prisma.branch.findFirst({ where: { companyId, isActive: true } });
}

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const businessDate = toISODate(new Date());

    const branch = await resolveDefaultBranch(companyId);
    if (!branch) {
      return NextResponse.json({ error: "No branch found for this company" }, { status: 404 });
    }

    const dayClosing = await prisma.dayClosing.findUnique({
      where: {
        companyId_branchId_businessDate: { companyId, branchId: branch.id, businessDate: toBusinessDate(businessDate) },
      },
      include: {
        closedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      businessDate,
      branch: {
        id: branch.id,
        branchName: branch.branchName,
        branchDisplayName: branch.branchDisplayName || branch.branchName,
        openingTime: formatTime(branch.openingTime),
        closingTime: formatTime(branch.closingTime),
        graceHours: formatTime(branch.graceHours),
        dayEndAutoClosing: branch.dayEndAutoClosing,
      },
      isClosed: Boolean(dayClosing),
      dayClosing: dayClosing
        ? {
            id: dayClosing.id,
            closedAt: dayClosing.closedAt,
            closedBy: dayClosing.closedByUser.name,
            closedByUserId: dayClosing.closedByUserId,
          }
        : null,
    });
  } catch (error) {
    console.error("Day closing status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();

    let businessDate = toISODate(new Date());
    const body = await request.json().catch(() => ({}));
    if (body.businessDate !== undefined) {
      if (!isValidBusinessDate(String(body.businessDate))) {
        return NextResponse.json({ error: "Invalid business date" }, { status: 400 });
      }
      businessDate = String(body.businessDate);
    }

    const branch = await resolveDefaultBranch(companyId);
    if (!branch) {
      return NextResponse.json({ error: "No branch found for this company" }, { status: 404 });
    }

    let record: {
      id: number;
      branchId: number;
      businessDate: string;
      closedAt: Date;
      closedBy: string;
      closedByUserId: number;
    } | null = null;
    try {
      record = await prisma.$transaction(async (tx) => {
        const existing = await tx.dayClosing.findUnique({
          where: {
            companyId_branchId_businessDate: {
              companyId,
              branchId: branch.id,
              businessDate: toBusinessDate(businessDate),
            },
          },
        });
        if (existing) {
          throw new Error("DAY_ALREADY_CLOSED");
        }
        const created = await tx.dayClosing.create({
          data: {
            companyId,
            branchId: branch.id,
            businessDate: toBusinessDate(businessDate),
            closedByUserId: userId,
            createdByUserId: userId,
          },
          include: {
            closedByUser: { select: { id: true, name: true } },
          },
        });
        return {
          id: created.id,
          branchId: created.branchId,
          businessDate: toISODate(created.businessDate),
          closedAt: created.closedAt,
          closedBy: created.closedByUser.name,
          closedByUserId: created.closedByUserId,
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message === "DAY_ALREADY_CLOSED") {
        return NextResponse.json(
          { error: "Day has already been closed for this branch" },
          { status: 409 }
        );
      }
      throw error;
    }

    if (!record) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        dayClosing: {
          id: record.id,
          branchId: record.branchId,
          businessDate: record.businessDate,
          closedAt: record.closedAt,
          closedBy: record.closedBy,
          closedByUserId: record.closedByUserId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Day closing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
