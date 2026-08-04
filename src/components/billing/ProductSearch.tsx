"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

interface ProductSearchProduct {
  id: number;
  productName: string;
  category: string | null;
  sellingPrice: number;
  currentStock: number;
  barcode: string | null;
  gstApplicable?: boolean;
  gstMaster?: { totalPercentage: number; cgstPercentage?: number; sgstPercentage?: number; igstPercentage?: number } | null;
}

interface ProductSearchProps {
  onAddProduct: (product: ProductSearchProduct) => void;
}

export default function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const [products, setProducts] = useState<ProductSearchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(
            data.products.map((p: ProductSearchProduct) => ({
              id: p.id,
              productName: p.productName,
              category: p.category,
              sellingPrice: Number(p.sellingPrice),
              currentStock: Number(p.currentStock),
              barcode: p.barcode,
              gstApplicable: p.gstApplicable,
              gstMaster: p.gstMaster,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter((c): c is string => c !== null)))];

  const filtered = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.productName.toLowerCase().includes(query.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(query.toLowerCase())))
  );

  function handleSelect(product: ProductSearchProduct) {
    if (product.currentStock <= 0) return;
    onAddProduct(product);
    setQuery("");
    setShowDropdown(false);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Product search */}
      <div className="relative flex-1" ref={dropdownRef}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(e.target.value.length > 0);
            }}
            onFocus={() => query.length > 0 && setShowDropdown(true)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
        {showDropdown && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {filtered.map((product) => (
              <button
                key={product.id}
                onMouseDown={() => handleSelect(product)}
                disabled={product.currentStock <= 0}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <span>{product.productName}</span>
                <span className="text-xs text-gray-400">
                  Stock: {product.currentStock}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category dropdown */}
      <div className="relative">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="appearance-none border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer bg-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Loading indicator */}
      {loading && (
        <span className="text-xs text-gray-400">Loading...</span>
      )}
    </div>
  );
}
