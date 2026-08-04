import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const course = searchParams.get("course");
    const department = searchParams.get("department");
    const academicYear = searchParams.get("academicYear");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = { companyId };

    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    if (course) where.course = course;
    if (department) where.department = department;
    if (academicYear) where.academicYear = academicYear;

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { admissionNumber: { contains: search } },
        { rollNumber: { contains: search } },
        { mobileNumber: { contains: search } },
        { email: { contains: search } },
        { course: { contains: search } },
        { department: { contains: search } },
      ];
    }

    const allowedSortFields = ["id", "firstName", "admissionNumber", "rollNumber", "course", "department", "academicYear", "mobileNumber", "isActive", "createdAt"];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      students,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Student list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();

    if (!body.firstName || !body.firstName.trim()) {
      return NextResponse.json({ error: "First Name is required" }, { status: 400 });
    }

    if (body.admissionNumber) {
      const dup = await prisma.student.findFirst({
        where: { companyId, admissionNumber: body.admissionNumber.trim(), id: { not: body.id || 0 } },
      });
      if (dup) return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
    }

    if (body.rollNumber) {
      const dup = await prisma.student.findFirst({
        where: { companyId, rollNumber: body.rollNumber.trim(), id: { not: body.id || 0 } },
      });
      if (dup) return NextResponse.json({ error: "Roll number already exists" }, { status: 409 });
    }

    const student = await prisma.student.create({
      data: {
        companyId,
        admissionNumber: body.admissionNumber?.trim() || null,
        firstName: body.firstName.trim(),
        lastName: body.lastName?.trim() || null,
        gender: body.gender || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        mobileNumber: body.mobileNumber?.trim() || null,
        email: body.email?.trim() || null,
        course: body.course?.trim() || null,
        department: body.department?.trim() || null,
        class: body.class?.trim() || null,
        section: body.section?.trim() || null,
        academicYear: body.academicYear?.trim() || null,
        rollNumber: body.rollNumber?.trim() || null,
        parentName: body.parentName?.trim() || null,
        parentMobile: body.parentMobile?.trim() || null,
        parentEmail: body.parentEmail?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        country: body.country?.trim() || "India",
        pincode: body.pincode?.trim() || null,
        remarks: body.remarks?.trim() || null,
        block: body.block?.trim() || null,
        roomNo: body.roomNo?.trim() || null,
        wallet: parseFloat(body.wallet) || 0,
        fingerPrint: body.fingerPrint || null,
        createdByUserId: userId,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error) {
    console.error("Student creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.student.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    if (updateData.admissionNumber) {
      const dup = await prisma.student.findFirst({
        where: { companyId, admissionNumber: updateData.admissionNumber.trim(), id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
    }

    if (updateData.rollNumber && updateData.rollNumber !== existing.rollNumber) {
      const dup = await prisma.student.findFirst({
        where: { companyId, rollNumber: updateData.rollNumber.trim(), id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "Roll number already exists" }, { status: 409 });
    }

    if (updateData.dateOfBirth) updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    if (updateData.wallet) updateData.wallet = parseFloat(updateData.wallet);
    updateData.updatedByUserId = userId;

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("Student update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.student.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
