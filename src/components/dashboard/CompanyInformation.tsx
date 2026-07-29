const DETAILS = [
  { label: "Branch:", value: "AHS" },
  { label: "System Date:", value: "27/07/2026" },
  { label: "License Date:", value: "01/01/2030" },
] as const;

export default function CompanyInformation() {
  return (
    <div>
      {/* Logo centered */}
      <div className="flex flex-col items-center py-6">
        <div className="w-[120px] h-[120px] border-2 border-blue-600 rounded-lg flex flex-col items-center justify-center bg-white">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stylized A */}
            <path
              d="M20 65L35 15H45L60 65"
              stroke="#2563eb"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M25 50H55"
              stroke="#2563eb"
              strokeWidth="3"
            />
            {/* Chart bars */}
            <rect x="30" y="35" width="6" height="20" fill="#22c55e" rx="1" />
            <rect x="38" y="25" width="6" height="30" fill="#f97316" rx="1" />
            <rect x="46" y="30" width="6" height="25" fill="#2563eb" rx="1" />
            {/* Checkmark */}
            <path
              d="M42 42L48 48L60 35"
              stroke="#22c55e"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[8px] text-gray-500 mt-0.5">AccountsHubSoft.com</span>
          <span className="text-[10px] font-bold text-red-600 tracking-wider">BILLING</span>
        </div>
        <span className="text-lg font-bold text-gray-800 mt-3">AHS</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Details */}
      <div className="py-4 space-y-2.5 px-1">
        {DETAILS.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-800 w-[160px]">{label}</span>
            <span className="text-sm text-gray-500">{value}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />
    </div>
  );
}
