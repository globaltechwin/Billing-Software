"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ProductSearchProps {
  onAddProduct: (product: string) => void;
}

const PRODUCTS = [
  "Shirt Wash",
  "Pant Iron",
  "Suit Dry Clean",
  "Saree Wash",
  "Bed Sheet Wash",
  "Towel Wash",
  "Jacket Clean",
  "Blanket Wash",
];

const CATEGORIES = ["Laundry Service", "Dry Cleaning", "Ironing", "Stain Removal"];

export default function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Laundry Service");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = PRODUCTS.filter((p) =>
    p.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(product: string) {
    onAddProduct(product);
    setQuery("");
    setShowDropdown(false);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Product search */}
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Enter Product"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(e.target.value.length > 0);
          }}
          onFocus={() => query.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
        {showDropdown && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {filtered.map((product) => (
              <button
                key={product}
                onMouseDown={() => handleSelect(product)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
              >
                {product}
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
          {CATEGORIES.map((cat) => (
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

      {/* Order input */}
      <input
        type="text"
        placeholder="Order"
        className="w-[80px] border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
      />
    </div>
  );
}
