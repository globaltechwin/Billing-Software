"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, Search } from "lucide-react";

export interface CustomerData {
  id: number;
  mobile: string;
  name: string;
  address: string;
  landmark: string;
  additionalMobile: string;
  attender: string;
  stateCode?: string;
}

interface CustomerFormProps {
  onCustomerSelect: (customer: CustomerData) => void;
  onClose: () => void;
}

const ATTENDERS = ["Ramesh", "Suresh", "Prakash", "Mahesh"];

interface ApiCustomer {
  id: number;
  customerName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  stateCode?: string;
}

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
  const [searchResults, setSearchResults] = useState<ApiCustomer[]>([]);
  const [searching, setSearching] = useState(false);
  const mobileRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mobileRef.current?.focus();
  }, []);

  function handleMobileChange(value: string) {
    setMobile(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length >= 3) {
      setSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        fetch(`/api/customers?search=${encodeURIComponent(value)}&activeOnly=true`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setSearchResults(data.customers);
          })
          .catch(() => {})
          .finally(() => setSearching(false));
      }, 300);
    } else {
      setSearchResults([]);
    }
  }

  function handleSelectExisting(customer: ApiCustomer) {
    onCustomerSelect({
      id: customer.id,
      mobile: customer.phone,
      name: customer.customerName,
      address: customer.address || "",
      landmark: "",
      additionalMobile: "",
      attender: "",
      stateCode: customer.stateCode,
    });
  }

  async function handleSubmit() {
    if (!name && !mobile) return;

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name || "Walk-in Customer",
          phone: mobile || "0000000000",
          address: address || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.customer) {
        onCustomerSelect({
          id: data.customer.id,
          mobile: data.customer.phone,
          name: data.customer.customerName,
          address: data.customer.address || "",
          landmark,
          additionalMobile,
          attender,
          stateCode: data.customer.stateCode,
        });
      }
    } catch {
      onCustomerSelect({
        id: 0,
        mobile,
        name: name || "Walk-in Customer",
        address,
        landmark,
        additionalMobile,
        attender,
      });
    }
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
        <div className="relative">
          <input
            ref={mobileRef}
            type="tel"
            placeholder="Customer Mobile"
            value={mobile}
            onChange={(e) => handleMobileChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          {searching && (
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-pulse" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
            {searchResults.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectExisting(c)}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 transition-colors"
              >
                {c.customerName} - {c.phone}
              </button>
            ))}
          </div>
        )}

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
