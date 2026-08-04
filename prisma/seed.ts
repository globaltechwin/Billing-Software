import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ALL_ROLES = ["Owner", "Admin", "Manager", "Senior Manager", "Cashier", "Captain", "Staff", "User", "Driver"];

const ALL_MODULES = [
  "Dashboard", "Billing", "View Bill", "Inventory", "Master", "Reports",
  "Admin", "Production", "Sales", "WhatsApp", "Events", "Cash Flow", "Accounting",
  "GST Management",
];

const DEFAULT_GST_RATES = [
  { name: "GST 0%", totalPercentage: 0, cgstPercentage: 0, sgstPercentage: 0, igstPercentage: 0 },
  { name: "GST 5%", totalPercentage: 5, cgstPercentage: 2.5, sgstPercentage: 2.5, igstPercentage: 5 },
  { name: "GST 12%", totalPercentage: 12, cgstPercentage: 6, sgstPercentage: 6, igstPercentage: 12 },
  { name: "GST 18%", totalPercentage: 18, cgstPercentage: 9, sgstPercentage: 9, igstPercentage: 18 },
  { name: "GST 28%", totalPercentage: 28, cgstPercentage: 14, sgstPercentage: 14, igstPercentage: 28 },
];

const DEFAULT_HSN_SAC = [
  { code: "0401", description: "Milk and cream", type: "HSN", defaultGstRateName: "GST 0%" },
  { code: "0713", description: "Dried leguminous vegetables (pulses)", type: "HSN", defaultGstRateName: "GST 0%" },
  { code: "1006", description: "Rice", type: "HSN", defaultGstRateName: "GST 5%" },
  { code: "1901", description: "Food preparations", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "2106", description: "Food preparations not elsewhere specified", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "2201", description: "Mineral waters and aerated waters", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "3004", description: "Medicaments", type: "HSN", defaultGstRateName: "GST 12%" },
  { code: "3304", description: "Beauty or make-up preparations", type: "HSN", defaultGstRateName: "GST 28%" },
  { code: "3401", description: "Soap and washing preparations", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "3808", description: "Insecticides, herbicides", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "3923", description: "Plastic articles for packing", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "4819", description: "Cartons, boxes of paper/paperboard", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "4901", description: "Printed books, brochures", type: "HSN", defaultGstRateName: "GST 0%" },
  { code: "6109", description: "T-shirts, singlets, tank tops (knitted)", type: "HSN", defaultGstRateName: "GST 5%" },
  { code: "6203", description: "Men's suits, jackets, trousers", type: "HSN", defaultGstRateName: "GST 12%" },
  { code: "6204", description: "Women's suits, dresses, skirts", type: "HSN", defaultGstRateName: "GST 12%" },
  { code: "6403", description: "Footwear with outer soles of rubber", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "7113", description: "Articles of jewellery", type: "HSN", defaultGstRateName: "GST 3%" },
  { code: "7321", description: "Stoves, ranges, ovens (iron/steel)", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8414", description: "Air/vacuum pumps, compressors", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8415", description: "Air conditioning machines", type: "HSN", defaultGstRateName: "GST 28%" },
  { code: "8418", description: "Refrigerators, freezers", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8422", description: "Dish washing machines, bottling/packing machinery", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8443", description: "Printing machinery", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8471", description: "Automatic data processing machines (computers)", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8504", description: "Electrical transformers, static converters", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8507", description: "Electric accumulators (batteries)", type: "HSN", defaultGstRateName: "GST 28%" },
  { code: "8517", description: "Telephones, smartphones, communication apparatus", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8528", description: "Monitors, projectors, TVs", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "8703", description: "Motor cars for transport of persons", type: "HSN", defaultGstRateName: "GST 28%" },
  { code: "8711", description: "Motorcycles (including mopeds)", type: "HSN", defaultGstRateName: "GST 28%" },
  { code: "9401", description: "Seats and chairs", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "9403", description: "Other furniture and parts", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "9503", description: "Toys, games, sports requisites", type: "HSN", defaultGstRateName: "GST 12%" },
  { code: "9608", description: "Pens, pencils, crayons, chalk", type: "HSN", defaultGstRateName: "GST 18%" },
  { code: "9954", description: "Construction services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9961", description: "Financial services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9963", description: "Real estate services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9964", description: "Rental services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9965", description: "Transport services", type: "SAC", defaultGstRateName: "GST 5%" },
  { code: "9966", description: "Postal and courier services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9967", description: "Telecom services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9968", description: "IT and BPO services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9971", description: "Business consulting services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9972", description: "Legal and accounting services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9973", description: "Management consulting services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9982", description: "Education services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9985", description: "Support services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9986", description: "Healthcare services", type: "SAC", defaultGstRateName: "GST 0%" },
  { code: "9988", description: "Manufacturing services", type: "SAC", defaultGstRateName: "GST 18%" },
  { code: "9991", description: "Public administration services", type: "SAC", defaultGstRateName: "GST 0%" },
  { code: "9992", description: "Social services", type: "SAC", defaultGstRateName: "GST 0%" },
];

async function main() {
  try {
    // ── Roles ──────────────────────────────────────────────
    console.log("Seeding roles...");
    const roleRecords: Record<string, { id: number }> = {};
    for (const roleName of ALL_ROLES) {
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
      roleRecords[roleName] = role;
      console.log(`  Role: ${roleName} (id: ${role.id})`);
    }

    // ── Permissions ────────────────────────────────────────
    console.log("Seeding permissions...");
    const permissionRecords: Record<string, number> = {};
    for (const mod of ALL_MODULES) {
      const existing = await prisma.permission.findFirst({ where: { module: mod } });
      const permission = existing || await prisma.permission.create({
        data: { name: `${mod}:access`, module: mod },
      });
      permissionRecords[mod] = permission.id;
    }
    console.log(`  ${ALL_MODULES.length} permissions ready`);

    // ── Role-Permission Mappings ───────────────────────────
    console.log("Seeding role-permission mappings...");
    const allModuleIds = Object.values(permissionRecords);
    const roleModuleMap: Record<string, number[]> = {
      Owner: allModuleIds,
      Admin: allModuleIds,
      Manager: allModuleIds.filter((_, i) => ALL_MODULES[i] !== "Admin"),
      "Senior Manager": allModuleIds.filter((_, i) => ALL_MODULES[i] !== "Admin"),
      Cashier: [permissionRecords["Dashboard"], permissionRecords["Billing"], permissionRecords["View Bill"]],
      Captain: [permissionRecords["Dashboard"], permissionRecords["View Bill"]],
      Staff: [permissionRecords["Dashboard"], permissionRecords["Billing"]],
      User: [permissionRecords["Dashboard"], permissionRecords["Billing"], permissionRecords["View Bill"], permissionRecords["Reports"]],
      Driver: [permissionRecords["Dashboard"], permissionRecords["View Bill"]],
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

    // ── GST Rates ─────────────────────────────────────────
    console.log("Seeding GST rates...");
    const gstRateMap: Record<string, number> = {};
    for (const gstData of DEFAULT_GST_RATES) {
      let existing = await prisma.gSTMaster.findFirst({ where: { name: gstData.name } });
      if (!existing) {
        existing = await prisma.gSTMaster.create({ data: { ...gstData, isCustom: false, isActive: true } });
      }
      gstRateMap[gstData.name] = existing.id;
    }
    console.log(`  ${DEFAULT_GST_RATES.length} GST rates ready`);

    // ── HSN/SAC Records ───────────────────────────────────
    console.log("Seeding HSN/SAC records...");
    let hsnCount = 0;
    for (const hsn of DEFAULT_HSN_SAC) {
      const existing = await prisma.hSNSac.findUnique({ where: { code: hsn.code } });
      if (!existing) {
        const defaultGstRateId = gstRateMap[hsn.defaultGstRateName] || null;
        await prisma.hSNSac.create({
          data: {
            code: hsn.code,
            description: hsn.description,
            type: hsn.type,
            defaultGstRateId,
            isActive: true,
          },
        });
        hsnCount++;
      }
    }
    console.log(`  ${hsnCount} new HSN/SAC records created (${DEFAULT_HSN_SAC.length} total)`);

    // ── Company ───────────────────────────────────────────
    console.log("Seeding company...");
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          companyName: "Billora Demo Company",
          address: "123 Business Street, Chennai, Tamil Nadu 600001",
          phone: "+91 98765 43210",
          email: "info@billorademo.com",
          gstNumber: "33ABCDE1234F1Z5",
          gstStateCode: "33",
          stateName: "Tamil Nadu",
          gstEnabled: true,
          gstMode: "GST_VISIBLE",
          roundOffEnabled: false,
          allowInvoiceGstOverride: true,
          defaultHsnRequired: false,
          allowCustomGstRate: true,
          isActive: true,
        },
      });
    } else {
      // Update existing company with new GST settings fields
      await prisma.company.update({
        where: { id: company.id },
        data: {
          roundOffEnabled: company.roundOffEnabled ?? false,
          allowInvoiceGstOverride: company.allowInvoiceGstOverride ?? true,
          defaultHsnRequired: company.defaultHsnRequired ?? false,
          allowCustomGstRate: company.allowCustomGstRate ?? true,
        },
      });
    }
    console.log(`  Company: ${company.companyName} (id: ${company.id})`);

    // ── Head Office Branch ────────────────────────────────
    const branch = await prisma.branch.findFirst({ where: { companyId: company.id, isHeadOffice: true } });
    if (!branch) {
      await prisma.branch.create({
        data: {
          companyId: company.id,
          branchName: "Head Office",
          addr1: company.address,
          phone: company.phone,
          email: company.email,
          isHeadOffice: true,
          isDefault: true,
          isActive: true,
        },
      });
    }

    // ── Super Admin User ──────────────────────────────────
    console.log("Seeding superadmin...");
    const hashedPw = await bcrypt.hash("admin123", 10);
    let user = await prisma.user.findUnique({ where: { username: "superadmin" } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: "superadmin",
          email: "admin@billora.com",
          password: hashedPw,
          name: "Super Admin",
          mobileNumber: "9876543210",
          defaultCompanyId: company.id,
          roleId: roleRecords["Owner"].id,
          isActive: true,
        },
      });
    }
    await prisma.userCompany.upsert({
      where: { userId_companyId: { userId: user.id, companyId: company.id } },
      update: {},
      create: { userId: user.id, companyId: company.id, roleId: roleRecords["Owner"].id },
    });
    console.log(`  User: superadmin / admin123 (Owner)`);

    // ── Vendors ────────────────────────────────────────────
    console.log("Seeding vendors...");
    const gst18 = await prisma.gSTMaster.findFirst({ where: { name: "GST 18%" } });
    const sampleProducts = await prisma.product.findMany({ where: { companyId: company.id }, take: 3 });

    const vendorData = [
      { vendorCode: "VEND0001", vendorName: "Fresh Foods Suppliers", contactPerson: "Rajesh Kumar", mobileNumber: "9876543210", gstNumber: "33BBBBB1234F1Z5", state: "Tamil Nadu", stateCode: "33", paymentTerms: "30 Days", creditLimit: 500000 },
      { vendorCode: "VEND0002", vendorName: "Metro Wholesale", contactPerson: "Priya Sharma", mobileNumber: "9876543211", gstNumber: "27CCCCC1234F1Z5", state: "Maharashtra", stateCode: "27", paymentTerms: "15 Days", creditLimit: 300000 },
      { vendorCode: "VEND0003", vendorName: "Green Valley Traders", contactPerson: "Arun Patel", mobileNumber: "9876543212", gstNumber: "24DDDDD1234F1Z5", state: "Gujarat", stateCode: "24", paymentTerms: "Credit", creditLimit: 200000 },
    ];

    const vendorIds: number[] = [];
    for (const v of vendorData) {
      const existing = await prisma.vendor.findFirst({ where: { companyId: company.id, vendorCode: v.vendorCode } });
      if (!existing) {
        const created = await prisma.vendor.create({ data: { ...v, companyId: company.id, currentBalance: 0 } });
        vendorIds.push(created.id);
      } else {
        vendorIds.push(existing.id);
      }
    }
    console.log(`  ${vendorData.length} vendors created`);

    // ── Purchase Orders ────────────────────────────────────
    console.log("Seeding purchase orders...");
    if (sampleProducts.length > 0 && vendorIds.length > 0) {
      const poItems = sampleProducts.map((p, i) => ({
        productId: p.id,
        quantity: 10 + i * 5,
        receivedQty: i === 0 ? 15 : i === 1 ? 10 : 0,
        unit: p.unit,
        purchasePrice: Number(p.purchasePrice),
        discount: 0,
        gstPercentage: gst18 ? Number(gst18.totalPercentage) : 18,
        cgstAmount: (10 + i * 5) * Number(p.purchasePrice) * 0.09,
        sgstAmount: (10 + i * 5) * Number(p.purchasePrice) * 0.09,
        igstAmount: 0,
        taxAmount: (10 + i * 5) * Number(p.purchasePrice) * 0.18,
        lineTotal: (10 + i * 5) * Number(p.purchasePrice) * 1.18,
      }));

      const subtotal = poItems.reduce((s, i) => s + i.lineTotal - i.taxAmount, 0);
      const tax = poItems.reduce((s, i) => s + i.taxAmount, 0);

      const existingPO = await prisma.purchaseOrder.findFirst({ where: { companyId: company.id, poNumber: "PO000001" } });
      if (!existingPO) {
        const po1 = await prisma.purchaseOrder.create({
          data: {
            poNumber: "PO000001", companyId: company.id, vendorId: vendorIds[0],
            status: "PARTIALLY_RECEIVED", subtotal, taxAmount: tax, grandTotal: subtotal + tax,
            createdByUserId: user.id, approvedByUserId: user.id,
          },
        });
        await prisma.purchaseOrderItem.createMany({ data: poItems.map((item) => ({ ...item, purchaseOrderId: po1.id })) });

        const po2Subtotal = 5000;
        const po2Tax = 900;
        const po2 = await prisma.purchaseOrder.create({
          data: {
            poNumber: "PO000002", companyId: company.id, vendorId: vendorIds[1],
            status: "COMPLETED", subtotal: po2Subtotal, taxAmount: po2Tax, grandTotal: po2Subtotal + po2Tax,
            createdByUserId: user.id, approvedByUserId: user.id,
          },
        });
        if (sampleProducts[0]) {
          await prisma.purchaseOrderItem.create({
            data: {
              purchaseOrderId: po2.id, productId: sampleProducts[0].id, quantity: 20, receivedQty: 20,
              unit: "NOS", purchasePrice: 250, discount: 0, gstPercentage: 18,
              cgstAmount: 450, sgstAmount: 450, igstAmount: 0, taxAmount: 900, lineTotal: 5900,
            },
          });
        }
        console.log("  2 purchase orders created");

        // ── Goods Receipts ─────────────────────────────────
        console.log("Seeding goods receipts...");
        const grn1 = await prisma.goodsReceipt.create({
          data: {
            grnNumber: "GRN000001", companyId: company.id, purchaseOrderId: po1.id,
            vendorId: vendorIds[0], status: "PARTIAL", createdByUserId: user.id,
          },
        });
        if (sampleProducts[0]) {
          await prisma.goodsReceiptItem.create({
            data: {
              goodsReceiptId: grn1.id, productId: sampleProducts[0].id,
              orderedQty: 10, receivedQty: 10, pendingQty: 0,
            },
          });
          const p = sampleProducts[0];
          const newBal = Number(p.currentStock) + 10;
          await prisma.product.update({ where: { id: p.id }, data: { currentStock: newBal } });
          await prisma.inventoryLedger.create({
            data: {
              companyId: company.id, productId: p.id, quantityIn: 10, quantityOut: 0, balance: newBal,
              referenceType: "PURCHASE", referenceId: grn1.id, referenceNumber: "GRN000001",
              createdByUserId: user.id,
            },
          });
        }

        const grn2 = await prisma.goodsReceipt.create({
          data: {
            grnNumber: "GRN000002", companyId: company.id, purchaseOrderId: po2.id,
            vendorId: vendorIds[1], status: "COMPLETED", createdByUserId: user.id,
          },
        });
        if (sampleProducts[0]) {
          await prisma.goodsReceiptItem.create({
            data: {
              goodsReceiptId: grn2.id, productId: sampleProducts[0].id,
              orderedQty: 20, receivedQty: 20, pendingQty: 0,
            },
          });
          const p = sampleProducts[0];
          const newBal = Number(p.currentStock) + 20;
          await prisma.product.update({ where: { id: p.id }, data: { currentStock: newBal } });
          await prisma.inventoryLedger.create({
            data: {
              companyId: company.id, productId: p.id, quantityIn: 20, quantityOut: 0, balance: newBal,
              referenceType: "PURCHASE", referenceId: grn2.id, referenceNumber: "GRN000002",
              createdByUserId: user.id,
            },
          });
        }
        console.log("  2 goods receipts created");

        // ── Purchase Invoice ───────────────────────────────
        console.log("Seeding purchase invoice...");
        const pi = await prisma.purchaseInvoice.create({
          data: {
            invoiceNumber: "PINV000001", vendorInvoiceNo: "VEN-INV-001",
            companyId: company.id, vendorId: vendorIds[0], purchaseOrderId: po1.id, grnId: grn1.id,
            subtotal: 5000, taxAmount: 900, grandTotal: 5900, paymentStatus: "PARTIALLY_PAID",
            createdByUserId: user.id,
          },
        });
        console.log("  1 purchase invoice created");

        // ── Vendor Payment ─────────────────────────────────
        console.log("Seeding vendor payment...");
        await prisma.vendorPayment.create({
          data: {
            paymentNumber: "PAY000001", companyId: company.id, vendorId: vendorIds[0],
            purchaseInvoiceId: pi.id, amount: 3000, paymentMethod: "BANK",
            referenceNumber: "NEFT-12345", createdByUserId: user.id,
          },
        });
        await prisma.vendor.update({ where: { id: vendorIds[0] }, data: { currentBalance: 2900 } });
        await prisma.purchaseInvoice.update({ where: { id: pi.id }, data: { paymentStatus: "PARTIALLY_PAID" } });
        console.log("  1 vendor payment created");
      }
    }

    console.log("\n═══════════════════════════════════════════");
    console.log("Seeding complete!");
    console.log("\nRoles: " + ALL_ROLES.join(", "));
    console.log(`\nGST Rates: ${DEFAULT_GST_RATES.length}`);
    console.log(`HSN/SAC Records: ${DEFAULT_HSN_SAC.length}`);
    console.log("Vendors: 3");
    console.log("Purchase Orders: 2");
    console.log("Goods Receipts: 2");
    console.log("Purchase Invoice: 1");
    console.log("Vendor Payment: 1");
    console.log("\nLogin: superadmin / admin123");
    console.log("═══════════════════════════════════════════");
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
