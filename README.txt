Billora Product Master - Bulk Import Update

Files to copy into your project, preserving folder structure:
- src/components/product/ProductPage.tsx
- src/app/api/products/bulk/route.ts

How to use:
1. Copy these two files into C:\projects\Billing-Software, allowing replacement.
2. Restart the dev server.
3. Open Master > Product.
4. Click Template to download the current template, or use billora-product-template.csv included here.
5. Open the CSV in Excel, replace the sample row with your products, and keep the header names unchanged.
6. Save As > CSV UTF-8 (*.csv).
7. Click Upload Excel / CSV and select the saved CSV.
8. The page shows the imported count and any row errors.

Required columns: productName, unit, sellingPrice, gstMasterName.
The gstMasterName must exactly match an active tax-group name in Billora (case-insensitive), e.g. GST 0% if that tax group exists.
Optional columns: productCode, category, purchasePrice, barcode, hsnCode, currentStock, minimumStock, maximumStock, reorderLevel, isActive.
Numbers must be non-negative. isActive accepts true/false, yes/no, 1/0, active/inactive.
Maximum: 1,000 rows per upload.

Note: This uploader accepts CSV UTF-8 files (Excel-compatible CSV), not native .xlsx files. Download Products also exports CSV that opens in Excel.
