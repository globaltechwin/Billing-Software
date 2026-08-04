import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setAuthCookie, shouldSecureCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
        userCompanies: {
          include: {
            company: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      await logLoginAttempt(null, false, request);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      await logLoginAttempt(user.id, false, request);
      return NextResponse.json(
        { error: "Account is deactivated. Contact administrator." },
        { status: 403 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      await logLoginAttempt(user.id, false, request);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    await logLoginAttempt(user.id, true, request);

    // Determine active company
    let activeCompanyId: number;

    if (user.userCompanies.length === 1) {
      activeCompanyId = user.userCompanies[0].companyId;
    } else if (user.defaultCompanyId) {
      const defaultUC = user.userCompanies.find(
        (uc) => uc.companyId === user.defaultCompanyId
      );
      activeCompanyId = defaultUC ? defaultUC.companyId : user.userCompanies[0].companyId;
    } else {
      activeCompanyId = user.userCompanies[0].companyId;
    }

    const activeCompany = user.userCompanies.find(
      (uc) => uc.companyId === activeCompanyId
    );

    // Get permissions for this user's role in the active company
    const activeRoleId = activeCompany?.roleId || user.roleId;
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: activeRoleId },
      include: { permission: { select: { module: true } } },
    });
    const allowedModules = [...new Set(rolePermissions.map((rp) => rp.permission.module))];

    // Fetch user menu access (blocked paths)
    const menuAccess = await prisma.userMenuAccess.findMany({
      where: { userId: user.id, companyId: activeCompanyId },
      select: { menuPath: true, allowed: true },
    });

    // Compute allowed menu paths
    let allowedMenuPaths: string[] | null = null;
    if (menuAccess.length > 0) {
      // User has custom access — compute allowed paths from menu-config
      const { flattenMenuPaths } = await import("@/lib/menu-config");
      const allPaths = flattenMenuPaths();
      const blockedPaths = new Set(menuAccess.filter((m) => !m.allowed).map((m) => m.menuPath));
      const explicitlyAllowed = new Set(menuAccess.filter((m) => m.allowed).map((m) => m.menuPath));
      allowedMenuPaths = allPaths.filter((p) => explicitlyAllowed.has(p) || !blockedPaths.has(p));
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      companyId: activeCompanyId,
    });

    await setAuthCookie(token, shouldSecureCookie(request));

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: activeCompany?.role.name || user.role.name,
        companyId: activeCompanyId,
        companyName: activeCompany?.company.companyName || "",
      },
      allowedModules,
      allowedMenuPaths,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function logLoginAttempt(
  userId: number | null,
  success: boolean,
  request: NextRequest
) {
  if (!userId) return;

  try {
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await prisma.loginHistory.create({
      data: {
        userId,
        success,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
}
