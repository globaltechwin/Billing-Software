"use client";

interface POSCategory { id: string; name: string }
interface POSCategoriesProps {
  categories: POSCategory[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CATEGORY_COLORS = [
  "bg-gradient-to-br from-purple-500 to-purple-400",
  "bg-gradient-to-br from-green-500 to-green-400",
  "bg-gradient-to-br from-blue-500 to-blue-400",
  "bg-gradient-to-br from-indigo-400 to-indigo-300",
  "bg-gradient-to-br from-orange-500 to-orange-400",
  "bg-gradient-to-br from-pink-500 to-pink-400",
];

export default function POSCategories({ categories, activeCategory, onCategoryChange }: POSCategoriesProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      {categories.map((cat, index) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} text-white text-lg font-bold px-10 py-6 rounded-xl shadow-md hover:scale-105 transition-transform min-w-[140px]`}
        >
          {cat.name.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
