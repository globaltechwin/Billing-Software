import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface CompanyContext {
  userId: number;
  username: string;
  companyId: number;
}

export async function getUserRole(ctx: CompanyContext): Promise<string> {
  const userCompany = await prisma.userCompany.findFirst({
    where: { userId: ctx.userId, companyId: ctx.companyId },
    include: { role: { select: { name: true } } },
  });
  return userCompany?.role?.name || "";
}

export async function isOwner(ctx: CompanyContext): Promise<boolean> {
  return (await getUserRole(ctx)) === "Owner";
}

export async function isAdmin(ctx: CompanyContext): Promise<boolean> {
  const role = await getUserRole(ctx);
  return role === "Owner" || role === "Admin";
}

export async function getCurrentCompanyId(): Promise<number> {
  const h = await headers();
  const companyId = h.get("x-company-id");
  if (!companyId) {
    throw new Error("Company context not available. Ensure middleware is running.");
  }
  return parseInt(companyId, 10);
}

export async function getCurrentUserId(): Promise<number> {
  const h = await headers();
  const userId = h.get("x-user-id");
  if (!userId) {
    throw new Error("User context not available.");
  }
  return parseInt(userId, 10);
}

export async function getCompanyContext(): Promise<CompanyContext> {
  const h = await headers();
  const userId = h.get("x-user-id");
  const username = h.get("x-user-role");
  const companyId = h.get("x-company-id");

  if (!userId || !companyId) {
    throw new Error("Unauthorized");
  }

  return {
    userId: parseInt(userId, 10),
    username: username || "",
    companyId: parseInt(companyId, 10),
  };
}
