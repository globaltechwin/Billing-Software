import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";

export async function GET() {
  try {
    const ctx = await getCompanyContext();
    const companyId = ctx.companyId;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        companyName: true,
        logo: true,
        shortCode: true,
        themePrimary: true,
        themePrimaryDark: true,
        themeAccent: true,
        themeWarm: true,
        themeBgDark: true,
        themeBgDarker: true,
        themeCardDark: true,
        themeNavBg: true,
        address: true,
        phone: true,
        email: true,
        gstNumber: true,
        gstStateCode: true,
        stateName: true,
        gstEnabled: true,
        gstMode: true,
        roundOffEnabled: true,
        allowInvoiceGstOverride: true,
        defaultHsnRequired: true,
        allowCustomGstRate: true,
        panNumber: true,
        city: true,
        country: true,
        pincode: true,
        website: true,
        bankAccountHolder: true,
        bankAccountNumber: true,
        bankIfsc: true,
        bankName: true,
        bankBranch: true,
        defaultBillingMode: true,
        invoicePrefix: true,
        estimatePrefix: true,
        creditBillPrefix: true,
        autoNumberGeneration: true,
        decimalPrecision: true,
        defaultPaymentMode: true,
        lowStockAlert: true,
        negativeStockAllowed: true,
        defaultWarehouseId: true,
        barcodeSettings: true,
        defaultPrintTemplateId: true,
        paperSize: true,
        printPreviewEnabled: true,
        defaultGstPercentage: true,
        igstEnabled: true,
        currency: true,
        currencySymbol: true,
        timeZone: true,
        dateFormat: true,
        financialYear: true,
        language: true,
        licenseDate: true,
        tableTypes: true,
        orderTypes: true,
        productCategories: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId: ctx.userId, companyId },
      },
      include: { role: { select: { name: true } } },
    });

    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { profileImage: true },
    });

    return NextResponse.json({
      success: true,
      settings: company,
      role: userCompany?.role.name || "",
      profileImage: user?.profileImage || null,
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    const companyId = ctx.companyId;

    // Only Owners and Admins may change company settings
    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: ctx.userId, companyId } },
      include: { role: { select: { name: true } } },
    });
    const roleName = userCompany?.role.name;
    if (roleName !== "Owner" && roleName !== "Admin") {
      return NextResponse.json(
        { error: "Only company owners/admins can update settings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Logo is superadmin (Owner) only
    if ("logo" in body && roleName !== "Owner") {
      return NextResponse.json(
        { error: "Only the company owner can update the logo" },
        { status: 403 }
      );
    }

    const allowedFields = [
      "companyName", "logo", "shortCode",
      "themePrimary", "themePrimaryDark", "themeAccent", "themeWarm",
      "themeBgDark", "themeBgDarker", "themeCardDark", "themeNavBg",
      "address", "phone", "email",
      "gstNumber", "gstStateCode", "stateName",
      "gstEnabled", "gstMode", "roundOffEnabled",
      "allowInvoiceGstOverride", "defaultHsnRequired", "allowCustomGstRate",
      "panNumber", "city", "country", "pincode", "website",
      "bankAccountHolder", "bankAccountNumber", "bankIfsc", "bankName", "bankBranch",
      "defaultBillingMode", "invoicePrefix", "estimatePrefix", "creditBillPrefix",
      "autoNumberGeneration", "decimalPrecision", "defaultPaymentMode",
      "lowStockAlert", "negativeStockAllowed", "defaultWarehouseId", "barcodeSettings",
      "defaultPrintTemplateId", "paperSize", "printPreviewEnabled",
      "defaultGstPercentage", "igstEnabled",
      "currency", "currencySymbol", "timeZone", "dateFormat", "financialYear", "language",
      "licenseDate",
      "tableTypes", "orderTypes", "productCategories",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      select: {
        id: true,
        companyName: true,
        logo: true,
        shortCode: true,
        themePrimary: true,
        themePrimaryDark: true,
        themeAccent: true,
        themeWarm: true,
        themeBgDark: true,
        themeBgDarker: true,
        themeCardDark: true,
        themeNavBg: true,
        address: true,
        phone: true,
        email: true,
        gstNumber: true,
        gstStateCode: true,
        stateName: true,
        gstEnabled: true,
        gstMode: true,
        roundOffEnabled: true,
        allowInvoiceGstOverride: true,
        defaultHsnRequired: true,
        allowCustomGstRate: true,
        panNumber: true,
        city: true,
        country: true,
        pincode: true,
        website: true,
        bankAccountHolder: true,
        bankAccountNumber: true,
        bankIfsc: true,
        bankName: true,
        bankBranch: true,
        defaultBillingMode: true,
        invoicePrefix: true,
        estimatePrefix: true,
        creditBillPrefix: true,
        autoNumberGeneration: true,
        decimalPrecision: true,
        defaultPaymentMode: true,
        lowStockAlert: true,
        negativeStockAllowed: true,
        defaultWarehouseId: true,
        barcodeSettings: true,
        defaultPrintTemplateId: true,
        paperSize: true,
        printPreviewEnabled: true,
        defaultGstPercentage: true,
        igstEnabled: true,
        currency: true,
        currencySymbol: true,
        timeZone: true,
        dateFormat: true,
        financialYear: true,
        language: true,
        licenseDate: true,
        tableTypes: true,
        orderTypes: true,
        productCategories: true,
      },
    });

    return NextResponse.json({ success: true, settings: company });
  } catch (error) {
    console.error("Error updating company settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
