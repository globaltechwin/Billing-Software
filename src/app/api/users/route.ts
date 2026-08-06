import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getCompanyContext } from "@/lib/company-context";

// GET /api/users — list users based on role visibility
// - Owner (superadmin): sees ALL users across ALL companies
// - Admin / other roles: sees only users in their own company (excluding superadmin/Owner)
export async function GET(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    const myCompanyRole = await prisma.userCompany.findFirst({
      where: { userId: ctx.userId, companyId: ctx.companyId },
      include: { role: { select: { name: true } } },
    });
    const isOwner = myCompanyRole?.role?.name === "Owner";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereCondition: Record<string, any>;
    if (isOwner) {
      // Owner sees everything — no company filter
      whereCondition = {};
    } else {
      // Non-owner: only their own company
      whereCondition = { companyId: ctx.companyId };
    }

    const userCompanies = await prisma.userCompany.findMany({
      where: whereCondition,
      include: {
        user: { select: { id: true, username: true, name: true, email: true, mobileNumber: true, profileImage: true, isActive: true, createdAt: true } },
        role: { select: { id: true, name: true } },
        company: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const users = userCompanies
      .filter((uc) => {
        // Non-owner users cannot see Owner-role users (hides superadmin from company admins)
        if (!isOwner && uc.role.name === "Owner") return false;
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
        tableTypes: uc.tableTypes,
        productCategories: uc.productCategories,
        orderTypes: uc.orderTypes,
        createdAt: uc.createdAt,
      }))
      .filter((user, idx, arr) => arr.findIndex((u) => u.id === user.id) === idx);

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/users — create a new user (in existing company or new company)
export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    const body = await request.json();
    const { username, name, email, mobileNumber, password, roleId, companyName, companyId: targetCompanyIdInput, profileImage, tableTypes, productCategories, orderTypes } = body;

    if (!username || !name || !password || !roleId) {
      return NextResponse.json(
        { error: "Username, name, password, and role are required" },
        { status: 400 }
      );
    }

    // Resolve target company
    let finalCompanyId: number;
    let isNewCompany = false;

    if (targetCompanyIdInput) {
      // Add user to existing company
      finalCompanyId = parseInt(targetCompanyIdInput, 10);
      const callerCompany = await prisma.userCompany.findUnique({
        where: { userId_companyId: { userId: ctx.userId, companyId: finalCompanyId } },
      });
      if (!callerCompany) {
        return NextResponse.json({ error: "You do not have access to this company" }, { status: 403 });
      }
    } else if (companyName) {
      // Create new company
      isNewCompany = true;
      finalCompanyId = 0; // will be set after company creation
    } else {
      // Use caller's company
      finalCompanyId = ctx.companyId;
      const callerCompany = await prisma.userCompany.findUnique({
        where: { userId_companyId: { userId: ctx.userId, companyId: finalCompanyId } },
      });
      if (!callerCompany) {
        return NextResponse.json({ error: "You do not have access to this company" }, { status: 403 });
      }
    }

    // Check username uniqueness
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    // Check email uniqueness (auto-generate if not provided)
    const userEmail = email || `${username}@billora.local`;
    const existingEmail = await prisma.user.findUnique({ where: { email: userEmail } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      let companyId = finalCompanyId;

      if (isNewCompany && companyName) {
        // Create new company + default branch
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
        await tx.branch.create({
          data: {
            companyId: company.id,
            branchName: "Head Office",
            isHeadOffice: true,
            isDefault: true,
            isActive: true,
          },
        });
        companyId = company.id;
      }

      // Create user
      const user = await tx.user.create({
        data: {
          username,
          name,
          email: userEmail,
          mobileNumber: mobileNumber || null,
          profileImage: profileImage || null,
          password: hashedPassword,
          defaultCompanyId: companyId,
          roleId,
          isActive: true,
        },
      });

      // Map user to company
      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId,
          roleId,
          tableTypes: tableTypes || null,
          productCategories: productCategories || null,
          orderTypes: orderTypes || null,
        },
      });

      return { user, companyId };
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
    const { userId, name, email, mobileNumber, roleId, isActive, companyId, profileImage, tableTypes, productCategories, orderTypes } = body;

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
        data: {
          userId, companyId: targetCompanyId, roleId: roleId || userCompany.roleId,
          tableTypes: tableTypes || null,
          productCategories: productCategories || null,
          orderTypes: orderTypes || null,
        },
      });
    } else {
      const ucUpdateData: Record<string, unknown> = {};
      if (roleId !== undefined && roleId !== userCompany.roleId) ucUpdateData.roleId = roleId;
      if (tableTypes !== undefined) ucUpdateData.tableTypes = tableTypes;
      if (productCategories !== undefined) ucUpdateData.productCategories = productCategories;
      if (orderTypes !== undefined) ucUpdateData.orderTypes = orderTypes;
      if (Object.keys(ucUpdateData).length > 0) {
        await prisma.userCompany.update({
          where: { userId_companyId: { userId, companyId: targetCompanyId } },
          data: ucUpdateData,
        });
      }
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
