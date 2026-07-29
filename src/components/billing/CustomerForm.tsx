"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export interface CustomerData {
  mobile: string;
  name: string;
  address: string;
  landmark: string;
  additionalMobile: string;
  attender: string;
}

interface CustomerFormProps {
  onCustomerSelect: (customer: CustomerData) => void;
  onClose: () => void;
}

const ATTENDERS = ["Ramesh", "Suresh", "Prakash", "Mahesh"];

export default function CustomerForm({
  onCustomerSelect,
  onClose,
}: CustomerFormProps) {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [additionalMobile, setAdditionalMobile] = useState("");
  const [attender, setAttender] = useState("");
  const mobileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mobileRef.current?.focus();
  }, []);

  function handleSubmit() {
    onCustomerSelect({
      mobile,
      name,
      address,
      landmark,
      additionalMobile,
      attender,
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header with collapse */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Customer Details
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronUp size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-2.5">
        {/* Customer Mobile */}
        <input
          ref={mobileRef}
          type="tel"
          placeholder="Customer Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />

        {/* Customer Name */}
        <input
          type="text"
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />

        {/* Address + Landmark */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          <input
            type="text"
            placeholder="Landmark"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        {/* Additional Mobile + Attender */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="tel"
            placeholder="Additional Mobile"
            value={additionalMobile}
            onChange={(e) => setAdditionalMobile(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          <select
            value={attender}
            onChange={(e) => setAttender(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white cursor-pointer"
          >
            <option value="">Select Attender</option>
            {ATTENDERS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Save button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm transition-colors mt-1"
        >
          Save Customer
        </button>
      </div>
    </div>
  );
}
