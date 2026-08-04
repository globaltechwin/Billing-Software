import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateExpenseNumber } from "@/lib/number-generators";

interface ExpenseInput {
  expenseCategoryId?: number;
  expenseDate?: string;
  description?: string;
  amount?: number;
  vendorId?: number | null;
  vendorInvoiceNo?: string;
  comments?: string;
}

const COMMENTS_MAX = 500;

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: Record<string, unknown> = { companyId };

    if (fromDate && isValidDate(fromDate)) {
      where.expenseDate = {
        ...((where.expenseDate as Record<string, Date>) || {}),
        gte: new Date(`${fromDate}T00:00:00`),
      };
    }
    if (toDate && isValidDate(toDate)) {
      where.expenseDate = {
        ...((where.expenseDate as Record<string, Date>) || {}),
        lte: new Date(`${toDate}T23:59:59.999`),
      };
    }
    if (categoryId && !Number.isNaN(parseInt(categoryId, 10))) {
      where.expenseCategoryId = parseInt(categoryId, 10);
    }
    if (search) {
      where.OR = [
        { expenseNumber: { contains: search } },
        { description: { contains: search } },
        { vendorInvoiceNo: { contains: search } },
        { comments: { contains: search } },
        { expenseCategory: { categoryName: { contains: search } } },
        { vendor: { vendorName: { contains: search } } },
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          expenseCategory: { select: { id: true, categoryName: true } },
          vendor: { select: { id: true, vendorName: true } },
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy: [{ expenseDate: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    const result = expenses.map((e) => ({
      id: e.id,
      expenseNumber: e.expenseNumber,
      categoryId: e.expenseCategoryId,
      categoryName: e.expenseCategory.categoryName,
      expenseDate: e.expenseDate,
      description: e.description,
      amount: Number(e.amount),
      vendorId: e.vendorId,
      vendorName: e.vendor?.vendorName || "",
      vendorInvoiceNo: e.vendorInvoiceNo || "",
      comments: e.comments || "",
      createdBy: e.createdByUser.name,
      createdById: e.createdByUserId,
      createdDate: e.createdAt,
      updatedBy: e.updatedByUser?.name || "",
      updatedAt: e.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      expenses: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Expense list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body: ExpenseInput = await request.json();
    const { expenseCategoryId, expenseDate, description, amount, vendorId, vendorInvoiceNo, comments } = body;

    if (!expenseCategoryId) {
      return NextResponse.json({ error: "Expense category is required" }, { status: 400 });
    }
    if (!expenseDate || !isValidDate(expenseDate)) {
      return NextResponse.json({ error: "Expense date is required" }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    if (amount === undefined || amount === null || Number.isNaN(Number(amount)) || Number(amount) < 0) {
      return NextResponse.json({ error: "Amount is required and must be a positive number" }, { status: 400 });
    }
    if (comments && comments.length > COMMENTS_MAX) {
      return NextResponse.json({ error: `Comments cannot exceed ${COMMENTS_MAX} characters` }, { status: 400 });
    }

    const category = await prisma.expenseCategory.findFirst({
      where: { id: expenseCategoryId, companyId, isActive: true },
    });
    if (!category) {
      return NextResponse.json({ error: "Expense category not found" }, { status: 404 });
    }

    if (vendorId) {
      const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, companyId } });
      if (!vendor) {
        return NextResponse.json({ error: "Vendor not found in your company" }, { status: 404 });
      }
    }

    const expenseNumber = await generateExpenseNumber(companyId);

    const expense = await prisma.expense.create({
      data: {
        companyId,
        expenseNumber,
        expenseCategoryId,
        expenseDate: new Date(expenseDate),
        description: description.trim(),
        amount: Number(amount),
        vendorId: vendorId || null,
        vendorInvoiceNo: vendorInvoiceNo?.trim() || null,
        comments: comments?.trim() || null,
        createdByUserId: userId,
      },
      include: {
        expenseCategory: { select: { id: true, categoryName: true } },
        vendor: { select: { id: true, vendorName: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        expense: {
          id: expense.id,
          expenseNumber: expense.expenseNumber,
          categoryId: expense.expenseCategoryId,
          categoryName: expense.expenseCategory.categoryName,
          expenseDate: expense.expenseDate,
          description: expense.description,
          amount: Number(expense.amount),
          vendorId: expense.vendorId,
          vendorName: expense.vendor?.vendorName || "",
          vendorInvoiceNo: expense.vendorInvoiceNo || "",
          comments: expense.comments || "",
          createdBy: expense.createdByUser.name,
          createdDate: expense.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.expense.findFirst({ where: { id, companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (fields.expenseCategoryId !== undefined) {
      const category = await prisma.expenseCategory.findFirst({
        where: { id: fields.expenseCategoryId, companyId, isActive: true },
      });
      if (!category) {
        return NextResponse.json({ error: "Expense category not found" }, { status: 404 });
      }
      data.expenseCategoryId = fields.expenseCategoryId;
    }

    if (fields.expenseDate !== undefined) {
      if (!isValidDate(fields.expenseDate)) {
        return NextResponse.json({ error: "Expense date is required" }, { status: 400 });
      }
      data.expenseDate = new Date(fields.expenseDate);
    }

    if (fields.description !== undefined) {
      if (!fields.description || !String(fields.description).trim()) {
        return NextResponse.json({ error: "Description is required" }, { status: 400 });
      }
      data.description = String(fields.description).trim();
    }

    if (fields.amount !== undefined) {
      const amt = Number(fields.amount);
      if (Number.isNaN(amt) || amt < 0) {
        return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
      }
      data.amount = amt;
    }

    if (fields.vendorId !== undefined) {
      if (fields.vendorId) {
        const vendor = await prisma.vendor.findFirst({ where: { id: fields.vendorId, companyId } });
        if (!vendor) {
          return NextResponse.json({ error: "Vendor not found in your company" }, { status: 404 });
        }
        data.vendorId = fields.vendorId;
      } else {
        data.vendorId = null;
      }
    }

    if (fields.vendorInvoiceNo !== undefined) {
      data.vendorInvoiceNo = fields.vendorInvoiceNo?.trim() || null;
    }

    if (fields.comments !== undefined) {
      if (fields.comments && String(fields.comments).length > COMMENTS_MAX) {
        return NextResponse.json({ error: `Comments cannot exceed ${COMMENTS_MAX} characters` }, { status: 400 });
      }
      data.comments = fields.comments?.trim() || null;
    }

    data.updatedByUserId = userId;

    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: {
        expenseCategory: { select: { id: true, categoryName: true } },
        vendor: { select: { id: true, vendorName: true } },
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      expense: {
        id: expense.id,
        expenseNumber: expense.expenseNumber,
        categoryId: expense.expenseCategoryId,
        categoryName: expense.expenseCategory.categoryName,
        expenseDate: expense.expenseDate,
        description: expense.description,
        amount: Number(expense.amount),
        vendorId: expense.vendorId,
        vendorName: expense.vendor?.vendorName || "",
        vendorInvoiceNo: expense.vendorInvoiceNo || "",
        comments: expense.comments || "",
        createdBy: expense.createdByUser.name,
        createdDate: expense.createdAt,
        updatedBy: expense.updatedByUser?.name || "",
        updatedAt: expense.updatedAt,
      },
    });
  } catch (error) {
    console.error("Expense update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.expense.findFirst({ where: { id, companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Expense delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
