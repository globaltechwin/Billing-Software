"use client";

import { Plus } from "lucide-react";
import { type Product } from "./data";

interface POSProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export default function POSProductGrid({
  products,
  onAddProduct,
}: POSProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onAddProduct(product)}
          className={`${product.color} rounded-xl p-4 text-left hover:scale-105 transition-transform shadow-sm border border-gray-100`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">{product.name}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">₹{product.price}</p>
            </div>
            <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
              <Plus size={14} className="text-gray-600" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}