import CompanyInformation from "./CompanyInformation";
import FrequentlyUsed from "./FrequentlyUsed";

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Welcome */}
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Welcome <span className="font-normal text-gray-700">demo1,</span>
        </h1>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Company Information */}
        <CompanyInformation />

        {/* Frequently Used */}
        <div className="mt-6">
          <FrequentlyUsed />
        </div>
      </div>
    </div>
  );
}
