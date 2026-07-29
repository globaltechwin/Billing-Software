import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLES = ["Owner", "Admin", "User", "Delivery"];

const MODULES = [
  "Dashboard",
  "Billing",
  "View Bill",
  "Inventory",
  "Master",
  "Reports",
  "Admin",
  "Production",
  "Sales",
  "WhatsApp",
  "Events",
  "Cash Flow",
  "Accounting",
];

const DEFAULT_GST_RATES = [
  { name: "GST 0%", totalPercentage: 0, cgstPercentage: 0, sgstPercentage: 0, igstPercentage: 0 },
  { name: "GST 5%", totalPercentage: 5, cgstPercentage: 2.5, sgstPercentage: 2.5, igstPercentage: 5 },
  { name: "GST 12%", totalPercentage: 12, cgstPercentage: 6, sgstPercentage: 6, igstPercentage: 12 },
  { name: "GST 18%", totalPercentage: 18, cgstPercentage: 9, sgstPercentage: 9, igstPercentage: 18 },
  { name: "GST 28%", totalPercentage: 28, cgstPercentage: 14, sgstPercentage: 14, igstPercentage: 28 },
];

const DEFAULT_USERS = [
  { username: "owner", password: "owner123", name: "Owner Admin", roleName: "Owner" },
  { username: "admin", password: "admin123", name: "System Admin", roleName: "Admin" },
  { username: "user", password: "user123", name: "Staff User", roleName: "User" },
  { username: "delivery", password: "delivery123", name: "Delivery Staff", roleName: "Delivery" },
];

async function main() {
  try {
    console.log("Seeding roles...");
    const roleRecords: Record<string, { id: number }> = {};
    for (const roleName of ROLES) {
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
      roleRecords[roleName] = role;
      console.log(`  Role: ${roleName} (id: ${role.id})`);
    }

    console.log("Seeding permissions...");
    const permissionRecords: Record<string, number> = {};
    for (const mod of MODULES) {
      const existing = await prisma.permission.findFirst({ where: { module: mod } });
      const permission = existing
        ? existing
        : await prisma.permission.create({
            data: { name: `${mod}:access`, module: mod },
          });
      permissionRecords[mod] = permission.id;
      console.log(`  Permission: ${mod} (id: ${permission.id})`);
    }

    console.log("Seeding role-permission mappings...");
    const allModules = Object.values(permissionRecords);

    const roleModuleMap: Record<string, number[]> = {
      Owner: allModules,
      Admin: allModules.filter((_, i) => MODULES[i] !== "Admin"),
      User: [
        permissionRecords["Dashboard"],
        permissionRecords["Billing"],
        permissionRecords["View Bill"],
        permissionRecords["Reports"],
      ],
      Delivery: [
        permissionRecords["Dashboard"],
        permissionRecords["View Bill"],
      ],
    };

    for (const [roleName, moduleIds] of Object.entries(roleModuleMap)) {
      const roleId = roleRecords[roleName].id;
      for (const permissionId of moduleIds) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          update: {},
          create: { roleId, permissionId },
        });
      }
      console.log(`  ${roleName}: ${moduleIds.length} permissions`);
    }

    console.log("Seeding users...");
    for (const userData of DEFAULT_USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const roleId = roleRecords[userData.roleName].id;
      await prisma.user.upsert({
        where: { username: userData.username },
        update: { password: hashedPassword },
        create: {
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
          roleId,
          isActive: true,
        },
      });
      console.log(`  User: ${userData.username} / ${userData.password} (${userData.roleName})`);
    }

    console.log("Seeding GST rates...");
    for (const gstData of DEFAULT_GST_RATES) {
      const existing = await prisma.gSTMaster.findFirst({ where: { name: gstData.name } });
      if (!existing) {
        await prisma.gSTMaster.create({
          data: {
            name: gstData.name,
            totalPercentage: gstData.totalPercentage,
            cgstPercentage: gstData.cgstPercentage,
            sgstPercentage: gstData.sgstPercentage,
            igstPercentage: gstData.igstPercentage,
            isCustom: false,
            isActive: true,
          },
        });
      }
      console.log(`  ${gstData.name}: CGST ${gstData.cgstPercentage}% | SGST ${gstData.sgstPercentage}% | IGST ${gstData.igstPercentage}%`);
    }

    console.log("\nSeeding complete!");
    console.log("\nLogin credentials:");
    console.log("  Owner:    owner / owner123");
    console.log("  Admin:    admin / admin123");
    console.log("  User:     user / user123");
    console.log("  Delivery: delivery / delivery123");
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(() => process.exit(0));
