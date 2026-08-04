"use client";

import { useEffect, useState } from "react";

interface BranchInfo {
  openingTime: string;
  closingTime: string;
  graceHours: string;
}

export default function DayClosingPage() {
  const [today, setToday] = useState("");

  const [processing, setProcessing] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [businessDate, setBusinessDate] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/day-closing")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load day closing status"))))
      .then((data) => {
        setToday(new Date().toLocaleDateString("en-GB"));
        setBranchInfo({
          openingTime: data.branch.openingTime,
          closingTime: data.branch.closingTime,
          graceHours: data.branch.graceHours,
        });
        setBusinessDate(data.businessDate);
        setClosed(data.isClosed);
      })
      .catch(() => setNotice("Failed to load day closing status."))
      .finally(() => setLoading(false));
  }, []);

  const systemDate = (() => {
    if (!businessDate) return today;
    const [y, m, d] = businessDate.split("-");
    return `${d}/${m}/${y}`;
  })();

  const handleProcess = () => {
    setNotice("");
    setShowConfirm(true);
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    setProcessing(true);
    setNotice("");
    fetch("/api/day-closing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessDate }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to close the day");
        }
        return data;
      })
      .then(() => setClosed(true))
      .catch((error: Error) => setNotice(error.message))
      .finally(() => setProcessing(false));
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Day End Process</h2>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col lg:flex-row gap-6">
          {/* Left: Day Info */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 w-36">System Date :</span>
              <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>{systemDate || "--"}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-200">
              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 w-36">Opening Time :</span>
              <span className="text-sm font-medium text-gray-900">{branchInfo?.openingTime || "--:--"}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 w-36">Closing Time :</span>
              <span className="text-sm font-medium text-gray-900">{branchInfo?.closingTime || "--:--"}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white">
              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 w-36">Grace Hours :</span>
              <span className="text-sm font-medium text-gray-900">{branchInfo?.graceHours || "--"}</span>
            </div>
          </div>

          {/* Right: Alerts */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#f0a848] px-5 py-3">
              <h3 className="text-sm font-semibold text-white">Alerts</h3>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Please close/settle all the pending bills before closing the day.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="mx-6 border-t border-gray-200" />

        {/* Action */}
        <div className="px-6 py-5">
          {closed ? (
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                Day Closed Successfully
              </span>
            </div>
          ) : (
            <button
              onClick={handleProcess}
              disabled={processing || loading}
              className="px-6 py-2.5 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Process (Day End Closing)"}
            </button>
          )}
          {notice && (
            <p className="mt-3 text-sm text-red-600">{notice}</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">Confirm Day Closing</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                Are you sure you want to close the day? This action will finalize all transactions for{" "}
                <span className="font-semibold">{systemDate}</span>. Once closed, no further modifications will be allowed for this business day.
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
