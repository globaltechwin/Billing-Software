import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";

// GET /api/companies — list all companies the user belongs to
export async function GET() {
  try {
    const ctx = await getCompanyContext();

    const userCompanies = await prisma.userCompany.findMany({
      where: { userId: ctx.userId },
      include: {
        company: true,
        role: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const companies = userCompanies.map((uc) => ({
      id: uc.companyId,
      companyName: uc.company.companyName,
      logo: uc.company.logo,
      role: uc.role.name,
      isActive: uc.company.isActive,
      isCurrent: uc.companyId === ctx.companyId,
    }));

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error("Company list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/companies — create a new company (owner only)
export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    // Only Owners can create companies
    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: ctx.userId, companyId: ctx.companyId } },
      include: { role: true },
    });
    if (!userCompany || userCompany.role.name !== "Owner") {
      return NextResponse.json(
        { error: "Only company owners can create new companies" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      companyName, address, phone, email,
      gstNumber, gstStateCode, stateName,
      gstEnabled,
    } = body;

    if (!companyName || !address || !phone || !email || !stateName) {
      return NextResponse.json(
        { error: "Company name, address, phone, email, and state are required" },
        { status: 400 }
      );
    }

    const INDIAN_STATES: Record<string, string> = {
      "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
      "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
      "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
      "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
      "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
      "16": "Tripura", "17": "Meghalaya", "18": "Assam",
      "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
      "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
      "25": "Daman & Diu", "26": "Dadra & Nagar Haveli",
      "27": "Maharashtra", "28": "Andhra Pradesh (Old)",
      "29": "Karnataka", "30": "Goa", "31": "Lakshadweep",
      "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
      "35": "Andaman & Nicobar Islands", "36": "Telangana",
      "37": "Andhra Pradesh", "38": "Ladakh",
    };

    const resolvedStateCode = gstStateCode ||
      Object.entries(INDIAN_STATES).find(
        ([, name]) => name.toLowerCase() === stateName.toLowerCase()
      )?.[0] || null;

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          companyName,
          address,
          phone,
          email,
          gstNumber: gstEnabled ? gstNumber || null : null,
          gstStateCode: resolvedStateCode,
          stateName,
          gstEnabled: gstEnabled ?? true,
          gstMode: "GST_VISIBLE",
          createdByUserId: ctx.userId,
          isActive: true,
        },
      });

      // Create Head Office branch
      await tx.branch.create({
        data: {
          companyId: company.id,
          branchName: "Head Office",
          addr1: address,
          phone,
          email,
          isHeadOffice: true,
          isDefault: true,
          isActive: true,
        },
      });

      // Get Owner role
      let ownerRole = await tx.role.findFirst({ where: { name: "Owner" } });
      if (!ownerRole) {
        ownerRole = await tx.role.create({ data: { name: "Owner" } });
      }

      // Assign owner to new company
      await tx.userCompany.create({
        data: {
          userId: ctx.userId,
          companyId: company.id,
          roleId: ownerRole.id,
        },
      });

      // Create default GST rates if they don't exist
      const defaultGstRates = [
        { name: "GST 0%", totalPercentage: 0, cgstPercentage: 0, sgstPercentage: 0, igstPercentage: 0 },
        { name: "GST 5%", totalPercentage: 5, cgstPercentage: 2.5, sgstPercentage: 2.5, igstPercentage: 5 },
        { name: "GST 12%", totalPercentage: 12, cgstPercentage: 6, sgstPercentage: 6, igstPercentage: 12 },
        { name: "GST 18%", totalPercentage: 18, cgstPercentage: 9, sgstPercentage: 9, igstPercentage: 18 },
        { name: "GST 28%", totalPercentage: 28, cgstPercentage: 14, sgstPercentage: 14, igstPercentage: 28 },
      ];
      for (const gst of defaultGstRates) {
        const existing = await tx.gSTMaster.findFirst({ where: { name: gst.name } });
        if (!existing) {
          await tx.gSTMaster.create({ data: { ...gst, isCustom: false, isActive: true } });
        }
      }

      return company;
    });

    return NextResponse.json({
      success: true,
      company: {
        id: result.id,
        companyName: result.companyName,
        address: result.address,
        gstEnabled: result.gstEnabled,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Company creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/companies — update company details (owner only)
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: ctx.userId, companyId: ctx.companyId } },
      include: { role: true },
    });
    if (!userCompany || userCompany.role.name !== "Owner") {
      return NextResponse.json(
        { error: "Only company owners can update companies" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { companyName, address, phone, email, gstNumber, gstStateCode, stateName, gstEnabled, gstMode } = body;

    const company = await prisma.company.update({
      where: { id: ctx.companyId },
      data: {
        ...(companyName && { companyName }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(gstNumber !== undefined && { gstNumber }),
        ...(gstStateCode !== undefined && { gstStateCode }),
        ...(stateName && { stateName }),
        ...(gstEnabled !== undefined && { gstEnabled }),
        ...(gstMode && { gstMode }),
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
