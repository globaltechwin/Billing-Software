import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

function generateEAN13(): string {
  const prefix = "890";
  const body = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
  const partial = prefix + body;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(partial[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return partial + checkDigit;
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { productId, barcode } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, companyId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let newBarcode = barcode;

    if (!newBarcode) {
      let attempts = 0;
      do {
        newBarcode = generateEAN13();
        const existing = await prisma.product.findFirst({
          where: { barcode: newBarcode, companyId },
        });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        return NextResponse.json({ error: "Failed to generate unique barcode" }, { status: 500 });
      }
    } else {
      const existing = await prisma.product.findFirst({
        where: { barcode: newBarcode, companyId, id: { not: productId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Barcode already exists for another product" }, { status: 400 });
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { barcode: newBarcode },
    });

    return NextResponse.json({
      success: true,
      barcode: newBarcode,
      product: {
        id: product.id,
        productName: product.productName,
        sellingPrice: Number(product.sellingPrice),
        unit: product.unit,
      },
    });
  } catch (error) {
    console.error("Barcode generation error:", error);
    return NextResponse.json({ error: "Failed to generate barcode" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      const product = await prisma.product.findFirst({
        where: { id: parseInt(productId, 10), companyId },
        select: { id: true, productName: true, barcode: true, sellingPrice: true, unit: true, productCode: true },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, product });
    }

    const products = await prisma.product.findMany({
      where: { companyId, isActive: true },
      select: { id: true, productName: true, barcode: true, sellingPrice: true, unit: true, productCode: true },
      orderBy: { productName: "asc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Barcode fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
