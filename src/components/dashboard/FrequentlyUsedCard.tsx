import type { LucideIcon } from "lucide-react";

interface FrequentlyUsedCardProps {
  label: string;
  icon: LucideIcon;
  color: "orange" | "green" | "blue";
}

const COLOR_MAP = {
  orange: "bg-orange-100 text-orange-600",
  green: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
} as const;

export default function FrequentlyUsedCard({
  label,
  icon: Icon,
  color,
}: FrequentlyUsedCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-5 px-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer min-w-[130px]">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${COLOR_MAP[color]}`}
      >
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
