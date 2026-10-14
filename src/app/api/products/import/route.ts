import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export const runtime = "nodejs";
export const maxDuration = 60;

type Row = Record<string, unknown>;
const normalizeHeader = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const cell = (row: Row, ...aliases: string[]) => {
  const wanted = new Set(aliases.map(normalizeHeader));
  const key = Object.keys(row).find((name) => wanted.has(normalizeHeader(name)));
  return key === undefined ? "" : String(row[key] ?? "").trim();
};
const numberCell = (value: string, fallback = 0) => {
  if (!value) return fallback;
  const n = Number(value.replace(/[,₹\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
const truthy = (value: string, fallback = true) => {
  if (!value) return fallback;
  return ["true", "yes", "1", "active", "y"].includes(value.toLowerCase());
};

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an Excel file to upload." }, { status: 400 });
    if (!/\.xlsx?$/i.test(file.name)) return NextResponse.json({ error: "Only .xlsx and .xls files are supported." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Excel file must be 10 MB or smaller." }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(bytes, { type: "buffer", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return NextResponse.json({ error: "The workbook has no worksheet." }, { status: 400 });
    const rows = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[sheetName], { defval: "", raw: false });
    if (!rows.length) return NextResponse.json({ error: "The first worksheet contains no product rows." }, { status: 400 });

    const [categories, gstRates, company] = await Promise.all([
      prisma.productCategory.findMany({ where: { companyId, isActive: true }, select: { name: true } }),
      prisma.gSTMaster.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
      prisma.company.findUnique({ where: { id: companyId }, select: { defaultHsnRequired: true } }),
    ]);
    if (!company) return NextResponse.json({ error: "Current company was not found." }, { status: 400 });
    const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.name]));
    const gstByName = new Map(gstRates.map((g) => [g.name.trim().toLowerCase(), g.id]));

    let importedCount = 0;
    const errors: { row: number; message: string }[] = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const excelRow = index + 2;
      const productName = cell(row, "Product Name", "ProductName", "Name", "Product");
      const productCode = cell(row, "Product Code", "ProductCode", "Code");
      const barcode = cell(row, "Barcode", "Bar Code", "EAN");
      const rawCategory = cell(row, "Product Category", "Category", "ProductCategory");
      const rawUnit = cell(row, "UOM", "Unit", "Unit of Measure");
      const rawGst = cell(row, "gstMasterName", "GST Master Name", "Tax Group Name", "Tax Group", "GST Rate", "GST", "GST Name");
      const sellingPrice = numberCell(cell(row, "Selling Price", "SellingPrice", "Price", "Rate"), NaN);
      const purchasePrice = numberCell(cell(row, "Purchase Price", "PurchasePrice", "Cost Price"), sellingPrice);
      const currentStock = numberCell(cell(row, "Current Stock", "CurrentStock", "Stock", "Opening Stock"), 0);
      const minimumStock = numberCell(cell(row, "Minimum Stock", "MinimumStock"), 0);
      const maximumStock = numberCell(cell(row, "Maximum Stock", "MaximumStock"), 0);
      const reorderLevel = numberCell(cell(row, "Reorder Level", "ReorderLevel", "Reorder Qty", "Reorder Quantity"), 0);
      const hsnCode = cell(row, "HSN Code", "HSN", "HSN/SAC", "HSNSAC");
      const rawActive = cell(row, "Status", "Active", "Is Active");

      if (!productName) { errors.push({ row: excelRow, message: "Product Name is required." }); continue; }
      if (!rawCategory) { errors.push({ row: excelRow, message: `Category is required for '${productName}'.` }); continue; }
      const category = categoryByName.get(rawCategory.toLowerCase());
      if (!category) { errors.push({ row: excelRow, message: `Category '${rawCategory}' does not exist or is inactive for this company.` }); continue; }
      const gstMasterId = gstByName.get(rawGst.toLowerCase());
      if (!gstMasterId) { errors.push({ row: excelRow, message: `Tax Group '${rawGst || "(blank)"}' does not match an active GST rate.` }); continue; }
      if (!rawUnit) { errors.push({ row: excelRow, message: `UOM is required for '${productName}'.` }); continue; }
      if (!Number.isFinite(sellingPrice) || sellingPrice < 0) { errors.push({ row: excelRow, message: `Selling Price must be a valid non-negative number for '${productName}'.` }); continue; }
      if (!Number.isFinite(purchasePrice) || purchasePrice < 0 || ![currentStock, minimumStock, maximumStock, reorderLevel].every((n) => Number.isFinite(n) && n >= 0)) {
        errors.push({ row: excelRow, message: `Price/stock values are invalid for '${productName}'.` }); continue;
      }
      if (company.defaultHsnRequired && !hsnCode) { errors.push({ row: excelRow, message: `HSN/SAC is required for '${productName}' by company settings.` }); continue; }

      const existingCode = productCode ? await prisma.product.findFirst({ where: { companyId, productCode }, select: { id: true } }) : null;
      const existingBarcode = barcode ? await prisma.product.findFirst({ where: { companyId, barcode }, select: { id: true } }) : null;
      if (existingCode) { errors.push({ row: excelRow, message: `Product Code '${productCode}' already exists.` }); continue; }
      if (existingBarcode) { errors.push({ row: excelRow, message: `Barcode '${barcode}' already exists.` }); continue; }
      try {
        await prisma.product.create({ data: {
          companyId, productName, productCode: productCode || null, barcode: barcode || null,
          category, unit: rawUnit, purchasePrice, sellingPrice, gstMasterId,
          gstApplicable: truthy(cell(row, "GST Applicable", "GSTApplicable"), true),
          hsnCode: hsnCode || null, currentStock, minimumStock, maximumStock, reorderLevel,
          isActive: truthy(rawActive, true), description: cell(row, "Description") || null,
        } });
        importedCount++;
      } catch (error) {
        console.error(`Product Excel import failed on row ${excelRow}:`, error);
        errors.push({ row: excelRow, message: `Could not save '${productName}'. Check required fields and duplicate values.` });
      }
    }

    return NextResponse.json({ success: true, importedCount, skippedCount: errors.length, errors }, { status: 200 });
  } catch (error) {
    console.error("Product Excel import error:", error);
    return NextResponse.json({ error: "Excel import failed. Check the server terminal for details." }, { status: 500 });
  }
}
