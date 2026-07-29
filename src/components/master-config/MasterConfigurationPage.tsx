"use client";

import { useState } from "react";
import { Maximize2, Settings, X, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { ConfigSection, initialSections } from "./data";

export default function MasterConfigurationPage() {
  const [sections, setSections] = useState<ConfigSection[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleResetValue = (sectionId: string, value: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId && s.fields
          ? { ...s, fields: s.fields.map((f) => ({ ...f, value })) }
          : s
      )
    );
  };

  const handleReset = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId && s.fields
          ? { ...s, fields: s.fields.map((f) => ({ ...f, value: "1" })) }
          : s
      )
    );
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSaveBranchConfig = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Configuration saved successfully!
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
        {/* Title Bar */}
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Master Configuration</h2>
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-gray-700">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Settings className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);

              if (section.type === "reset") {
                return (
                  <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
                      <div className="flex items-center gap-6">
                        {section.fields?.map((field) => (
                          <div key={field.label} className="flex items-center gap-3">
                            <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                              {field.label}
                              {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => handleResetValue(section.id, e.target.value)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => handleReset(section.id)}
                          className="px-5 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (section.type === "list") {
                const hasItems = section.items && section.items.length > 0;
                return (
                  <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
                      <div className="flex items-center gap-3">
                        {section.addButtonLabel && (
                          <button className="px-5 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
                            {section.addButtonLabel}
                          </button>
                        )}
                        {section.hasChevron && hasItems && (
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && hasItems && (
                      <div className="border-t border-gray-100">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#3d9a7e] text-white">
                              <th className="px-6 py-3 text-left text-xs font-semibold w-16">S.NO</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold">NAME</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold w-32">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.items?.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm text-gray-700">{idx + 1}</td>
                                <td className="px-6 py-3 text-sm text-gray-700">{item}</td>
                                <td className="px-6 py-3">
                                  <div className="flex items-center gap-2">
                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                      Edit
                                    </button>
                                    <span className="text-gray-300">/</span>
                                    <button className="text-red-600 hover:text-red-800 text-xs font-medium">
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }

              if (section.type === "config") {
                return (
                  <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        {section.id === "whatsapp-api" && (
                          <MessageSquare className="w-4 h-4 text-green-500" />
                        )}
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        {section.hasConfigure && (
                          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm">
                            <Settings className="w-4 h-4" />
                            Configure
                          </button>
                        )}
                        {section.hasChevron && !section.hasConfigure && (
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {section.cloudPrint && (
                      <div className="flex items-center gap-4 mt-4">
                        <label className="text-sm text-gray-700 font-medium">Cloud Print</label>
                        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option>NO (Local Print)</option>
                          <option>YES (Cloud Print)</option>
                        </select>
                        {section.hasSave && (
                          <button
                            onClick={handleSaveBranchConfig}
                            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <span className="text-xs text-gray-400">&copy; 2025 - POS - V5.06.Nov</span>
          <span className="text-xs text-emerald-600 font-medium">LICENSE DATE 01/01/2030</span>
        </div>
      </div>
    </div>
  );
}
