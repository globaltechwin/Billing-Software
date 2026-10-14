"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Product = {
  id: number | string;
  productName: string;
  productCode?: string | null;
  barcode?: string | null;
  description?: string | null;
  unit?: string | null;
  sellingPrice?: number | string | null;
  currentStock?: number | string | null;
};

type ProductApiResponse = {
  success?: boolean;
  products?: Product[];
  error?: string;
};

export default function InvoiceProductCodeSearch({
  value,
  onChange,
  onSelect,
  className,
  placeholder = "Search product name, code, or barcode",
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: Product) => void;
  className?: string;
  placeholder?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState("");
  const [mounted, setMounted] = useState(false);
  const [popup, setPopup] = useState({ left: 0, top: 0, width: 280 });
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as ProductApiResponse;
        if (!response.ok || !Array.isArray(payload.products)) {
          throw new Error(payload.error || "Unable to load products. Check /api/products.");
        }
        if (active) {
          // Use the live API response as returned; normalize strings/numbers
          // only for matching and display, without modifying database records.
          setProducts(payload.products.filter((p) => p && p.productName));
          setFailed("");
        }
      })
      .catch((error: unknown) => {
        if (active) setFailed(error instanceof Error ? error.message : "Unable to load products.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updatePopupPosition = () => {
    const rect = input.current?.getBoundingClientRect();
    if (!rect) return;
    setPopup({
      left: Math.max(8, rect.left),
      top: rect.bottom + 4,
      width: Math.max(rect.width, 300),
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePopupPosition();
    const reposition = () => updatePopupPosition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !popupRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  const matches = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) return [];
    const has = (field: unknown) => String(field ?? "").toLocaleLowerCase().includes(query);
    const exact = (product: Product) =>
      [product.productCode, product.barcode, product.productName, product.id]
        .some((field) => String(field ?? "").toLocaleLowerCase() === query);
    return products
      .filter((product) =>
        has(product.productCode) ||
        has(product.barcode) ||
        has(product.productName) ||
        has(product.id)
      )
      .sort((a, b) =>
        Number(exact(b)) - Number(exact(a)) ||
        a.productName.localeCompare(b.productName)
      )
      .slice(0, 12);
  }, [products, value]);

  return (
    <div ref={root} className="relative w-full">
      <input
        ref={input}
        value={value}
        onFocus={() => {
          updatePopupPosition();
          setOpen(true);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          updatePopupPosition();
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={className || "w-full px-2 py-1 border border-gray-200 rounded text-sm"}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && matches.length > 0}
      />
      {mounted && open && value.trim() && createPortal(
        <div
          ref={popupRef}
          className="rounded-md border border-gray-300 bg-white shadow-xl"
          style={{
            position: "fixed",
            zIndex: 2147483000,
            left: popup.left,
            top: popup.top,
            width: popup.width,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading products…</div>
          ) : failed ? (
            <div className="px-3 py-2 text-sm text-red-600">{failed}</div>
          ) : matches.length ? (
            matches.map((product) => (
              <button
                type="button"
                key={String(product.id)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(product);
                  setOpen(false);
                }}
                className="block w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-blue-50"
              >
                <div className="font-medium text-sm">{product.productName}</div>
                <div className="text-xs text-gray-500">
                  Code: {product.productCode || "—"}
                  {product.barcode ? ` · Barcode: ${product.barcode}` : ""}
                  {" · "}Price: ₹{Number(product.sellingPrice || 0).toFixed(2)}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No matching products found</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
