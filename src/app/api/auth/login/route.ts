import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";

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
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
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

    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role.name,
    });

    await setAuthCookie(token);

    const permissions = user.role.rolePermissions.map(
      (rp) => ({
        name: rp.permission.name,
        module: rp.permission.module,
      })
    );

    const allowedModules = [...new Set(permissions.map((p) => p.module))];

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role.name,
      },
      permissions,
      allowedModules,
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
