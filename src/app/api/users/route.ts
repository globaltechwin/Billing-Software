import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getCompanyContext } from "@/lib/company-context";

// GET /api/users — list users across all companies the current user belongs to
export async function GET(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    // Companies the current user is a member of
    const myCompanies = await prisma.userCompany.findMany({
      where: { userId: ctx.userId },
      select: { companyId: true },
    });
    const companyIds = myCompanies.map((c) => c.companyId);

    const where = companyIds.length > 0
      ? { companyId: { in: companyIds } }
      : { companyId: -1 };

    const userCompanies = await prisma.userCompany.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, name: true, email: true, mobileNumber: true, profileImage: true, isActive: true, createdAt: true } },
        role: { select: { id: true, name: true } },
        company: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const users = userCompanies
      .filter((uc) => {
        if (uc.role.name === "Owner" && ctx.userId !== 23) return false;
        return true;
      })
      .map((uc) => ({
        id: uc.user.id,
        username: uc.user.username,
        name: uc.user.name,
        email: uc.user.email,
        mobileNumber: uc.user.mobileNumber,
        profileImage: uc.user.profileImage,
        isActive: uc.user.isActive,
        roleId: uc.roleId,
        roleName: uc.role.name,
        companyId: uc.company.id,
        companyName: uc.company.companyName,
        createdAt: uc.createdAt,
      }))
      .filter((user, idx, arr) => arr.findIndex((u) => u.id === user.id) === idx);

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/users — create a new user + company
export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    const body = await request.json();
    const { username, name, email, mobileNumber, password, roleId, companyName, profileImage } = body;

    if (!username || !name || !password || !roleId || !companyName) {
      return NextResponse.json(
        { error: "Username, name, password, role, and company name are required" },
        { status: 400 }
      );
    }

    // Resolve target company: if companyName provided, we'll create one; otherwise use caller's company
    const targetCompanyId = companyName ? 0 : ctx.companyId;

    // Verify the caller belongs to the target company (skip for superadmin creating new company)
    if (!companyName) {
      const callerCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId: ctx.userId, companyId: targetCompanyId },
        },
      });
      if (!callerCompany) {
        return NextResponse.json(
          { error: "You do not have access to this company" },
          { status: 403 }
        );
      }
    }

    // Check username uniqueness
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Check email uniqueness (auto-generate if not provided)
    const userEmail = email || `${username}@billora.local`;
    const existingEmail = await prisma.user.findUnique({ where: { email: userEmail } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          companyName,
          address: "",
          phone: "",
          email: userEmail,
          gstEnabled: true,
          gstMode: "GST_VISIBLE",
          isActive: true,
          createdByUserId: ctx.userId,
          stateName: "",
        },
      });

      // Create default branch
      await tx.branch.create({
        data: {
          companyId: company.id,
          branchName: "Head Office",
          isHeadOffice: true,
          isDefault: true,
          isActive: true,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          username,
          name,
          email: userEmail,
          mobileNumber: mobileNumber || null,
          profileImage: profileImage || null,
          password: hashedPassword,
          defaultCompanyId: company.id,
          roleId,
          isActive: true,
        },
      });

      // Map user to company
      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId,
        },
      });

      return { user, company };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        roleName: role.name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Internal server error: ${message}` }, { status: 500 });
  }
}

// PATCH /api/users — update a user
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    const body = await request.json();
    const { userId, name, email, mobileNumber, roleId, isActive, companyId, profileImage } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Resolve target company: explicit companyId, else the caller's active company
    const targetCompanyId = companyId ? parseInt(companyId, 10) : ctx.companyId;

    // Verify caller belongs to the target company
    const callerCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId: ctx.userId, companyId: targetCompanyId },
      },
    });
    if (!callerCompany) {
      return NextResponse.json(
        { error: "You do not have access to this company" },
        { status: 403 }
      );
    }

    // Verify user belongs to this company
    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId: targetCompanyId } },
    });
    if (!userCompany) {
      return NextResponse.json({ error: "User not found in this company" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
    if (profileImage !== undefined) updateData.profileImage = profileImage || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: updateData });
    }

    // Handle company reassignment (superadmin moves user to different company)
    if (companyId && companyId !== ctx.companyId && userCompany.companyId !== targetCompanyId) {
      await prisma.userCompany.delete({
        where: { userId_companyId: { userId, companyId: userCompany.companyId } },
      });
      await prisma.userCompany.create({
        data: { userId, companyId: targetCompanyId, roleId: roleId || userCompany.roleId },
      });
    } else if (roleId !== undefined && roleId !== userCompany.roleId) {
      await prisma.userCompany.update({
        where: { userId_companyId: { userId, companyId: targetCompanyId } },
        data: { roleId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users — delete a user from current company
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const companyIdParam = searchParams.get("companyId");

    if (!userIdParam) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const targetUserId = parseInt(userIdParam, 10);
    const targetCompanyId = companyIdParam ? parseInt(companyIdParam, 10) : ctx.companyId;

    // Cannot delete yourself
    if (targetUserId === ctx.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Verify the user belongs to this company
    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: targetUserId, companyId: targetCompanyId } },
    });
    if (!userCompany) {
      return NextResponse.json({ error: "User not found in this company" }, { status: 404 });
    }

    // Delete the UserCompany mapping
    await prisma.userCompany.delete({
      where: { userId_companyId: { userId: targetUserId, companyId: targetCompanyId } },
    });

    // If user has no remaining company memberships, deactivate them
    const remaining = await prisma.userCompany.count({
      where: { userId: targetUserId },
    });
    if (remaining === 0) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
