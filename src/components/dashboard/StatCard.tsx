import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  badge: "#" | "$";
  badgeColor: string;
}

export default function StatCard({
  icon: Icon,
  value,
  label,
  borderColor,
  iconBg,
  iconColor,
  badge,
  badgeColor,
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 border-l-4 shadow-sm flex flex-col justify-between min-h-[110px]`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: badgeColor, color: "#fff" }}
        >
          {badge}
        </span>
      </div>
      <div className="mt-3">
        <p
          className="text-2xl font-bold"
          style={{ color: borderColor }}
        >
          {value.toLocaleString()}
        </p>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}
