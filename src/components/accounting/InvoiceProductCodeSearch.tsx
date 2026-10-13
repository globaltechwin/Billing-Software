"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Product = {
  id: number; productName: string; productCode?: string | null; barcode?: string | null;
  description?: string | null; unit?: string | null; sellingPrice?: number | string | null;
  currentStock?: number | string | null;
};
export default function InvoiceProductCodeSearch({
  value, onChange, onSelect, className, placeholder = "Type product code or name",
}: {
  value: string; onChange: (value: string) => void;
  onSelect: (product: Product) => void; className?: string; placeholder?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" }).then(async r => {
      const j = await r.json();
      if (!r.ok || !j.success || !Array.isArray(j.products)) throw new Error(j.error || "Product list unavailable");
      if (active) setProducts(j.products);
    }).catch(e => { if (active) setFailed(e instanceof Error ? e.message : "Product list unavailable"); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const matches = useMemo(() => {
    const q = value.trim().toLocaleLowerCase();
    if (!q) return [];
    // Product numbers entered by staff may be the database ID, product code,
    // barcode, or a product name. Match all four; ID is compared as text so
    // partial numeric input (for example "32") also produces suggestions.
    const matchesField = (field: unknown) => String(field ?? "").toLocaleLowerCase().includes(q);
    return products.filter(p =>
      matchesField(p.id) || matchesField(p.productCode) ||
      matchesField(p.barcode) || matchesField(p.productName)
    ).sort((a, b) => {
      const exact = (p: Product) => [p.id, p.productCode, p.barcode, p.productName]
        .some(v => String(v ?? "").toLocaleLowerCase() === q);
      return Number(exact(b)) - Number(exact(a)) || a.productName.localeCompare(b.productName);
    }).slice(0, 12);
  }, [products, value]);
  return <div ref={root} className="relative w-full">
    <input value={value} onFocus={() => setOpen(true)} onChange={e => { onChange(e.target.value); setOpen(true); }}
      className={className || "w-full px-2 py-1 border border-gray-200 rounded text-sm"} placeholder={placeholder}
      autoComplete="off" role="combobox" aria-expanded={open && matches.length > 0} />
    {open && value.trim() && <div className="absolute z-[100] left-0 top-full mt-1 w-full min-w-[280px] max-h-64 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-xl">
      {matches.length ? matches.map(p => <button type="button" key={p.id}
        onMouseDown={e => e.preventDefault()} onClick={() => { onSelect(p); setOpen(false); }}
        className="block w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-blue-50">
        <div className="font-medium text-sm">{p.productName}</div>
        <div className="text-xs text-gray-500">ID: {p.id} · Code: {p.productCode || "—"}{p.barcode ? ` · Barcode: ${p.barcode}` : ""} · Price: ₹{Number(p.sellingPrice || 0).toFixed(2)}</div>
      </button>) : <div className="px-3 py-2 text-sm text-gray-500">{failed || "No matching products found"}</div>}
    </div>}
  </div>;
}
