"use client";

import { CATEGORIES } from "./data";

interface POSCategoriesProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  all: "bg-gradient-to-br from-purple-500 to-purple-400",
  food: "bg-gradient-to-br from-green-500 to-green-400",
  drinks: "bg-gradient-to-br from-blue-500 to-blue-400",
  grocery: "bg-gradient-to-br from-indigo-400 to-indigo-300",
  other: "bg-gradient-to-br from-orange-500 to-orange-400",
};

export default function POSCategories({
  activeCategory,
  onCategoryChange,
}: POSCategoriesProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`${CATEGORY_COLORS[cat.id]} text-white text-lg font-bold px-10 py-6 rounded-xl shadow-md hover:scale-105 transition-transform min-w-[140px]`}
        >
          {cat.name.toUpperCase() === "ALL" ? "Cat" : cat.name.toUpperCase()}
        </button>
      ))}
    </div>
  );
}