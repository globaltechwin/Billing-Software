"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Cloud,
  Database,
  HardDrive,
  Loader2,
  RefreshCw,
  Download,
  Trash2,
  Upload,
  RotateCcw,
  Shield,
} from "lucide-react";

interface CloudBackup {
  id: number;
  backupName: string;
  fileName: string;
  cloudPath: string | null;
  fileSize: number;
  fileSizeFormatted: string;
  createdAt: string;
}

interface CloudStatus {
  enabled: boolean;
  totalBackups: number;
  storageUsed: number;
  storageUsedFormatted: string;
  storageTotal: number;
  storageTotalFormatted: string;
  backups: CloudBackup[];
}

interface CompanyBackup {
  id: number;
  backupName: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  status: string;
  storageType: string;
  cloudPath: string | null;
  createdAt: string;
}

interface CompanyData {
  companyId: number;
  companyName: string;
  shortCode: string;
  isActive: boolean;
  backups: CompanyBackup[];
  totalBackups: number;
  completedBackups: number;
  failedBackups: number;
  totalSizeFormatted: string;
  cloudEnabled: boolean;
  latestBackupDate?: string;
}

export default function CloudBackupPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "companies" | "cloud">("dashboard");
  const [loading, setLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus | null>(null);
  const [companiesData, setCompaniesData] = useState<CompanyData[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCloudStatus = useCallback(() => {
    fetch("/api/backup/cloud")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCloudStatus(data.cloud);
      })
      .catch(() => {
        showToast("Failed to load cloud status", "error");
      });
  }, []);

  const fetchCompanies = useCallback(() => {
    fetch("/api/backup/companies")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCompaniesData(data.companies);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/backup/cloud").then((r) => r.json()),
      fetch("/api/backup/companies").then((r) => r.json()),
    ])
      .then(([cloudData, companiesResult]) => {
        if (cloudData.success) setCloudStatus(cloudData.cloud);
        if (companiesResult.success) {
          setCompaniesData(companiesResult.companies);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDeleteCloudBackup = (backupId: number) => {
    if (!confirm("Delete this cloud backup?")) return;
    fetch(`/api/backup/${backupId}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          showToast("Cloud backup deleted", "success");
          fetchCloudStatus();
        } else {
          showToast(data.error || "Delete failed", "error");
        }
      })
      .catch(() => showToast("Delete failed", "error"));
  };

  const storagePercentage = cloudStatus
    ? Math.min(100, (cloudStatus.storageUsed / cloudStatus.storageTotal) * 100)
    : 0;

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Cloud size={28} className="text-[#3d9a7e]" />
          Cloud Backup
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage cloud storage and backup across companies
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(["dashboard", "companies", "cloud"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-[#3d9a7e] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "dashboard" ? "Overview" : tab === "companies" ? "Companies" : "Cloud Storage"}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Companies</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {companiesData.length || "-"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Database size={20} className="text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Backups</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {companiesData.reduce((sum, c) => sum + c.totalBackups, 0) || "-"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <HardDrive size={20} className="text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cloud Backups</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {cloudStatus?.totalBackups ?? 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Cloud size={20} className="text-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {cloudStatus?.storageUsedFormatted ?? "0 B"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Database size={20} className="text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          {cloudStatus && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Cloud Storage Usage</h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#3d9a7e] h-3 rounded-full transition-all"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{cloudStatus.storageUsedFormatted} used</span>
                <span>{cloudStatus.storageTotalFormatted} total</span>
              </div>
            </div>
          )}

          {/* Recent Cloud Backups */}
          {cloudStatus && cloudStatus.backups.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 rounded-t-xl">
                <h3 className="text-sm font-semibold text-gray-700">Recent Cloud Backups</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#3d9a7e] text-white">
                      <th className="px-4 py-3 text-left font-medium">Backup Name</th>
                      <th className="px-4 py-3 text-left font-medium">Size</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cloudStatus.backups.slice(0, 10).map((backup) => (
                      <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{backup.backupName}</td>
                        <td className="px-4 py-3 text-gray-600">{backup.fileSizeFormatted}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(backup.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteCloudBackup(backup.id)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === "companies" && (
        <div className="space-y-4">
          {/* Bulk Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#3d9a7e]" />
              <span className="text-sm font-semibold text-gray-700">Superadmin Controls</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (!confirm("Backup all companies now?")) return;
                  setLoading(true);
                  try {
                    const res = await fetch("/api/backup/bulk", { method: "POST" });
                    const data = await res.json();
                    if (data.success) {
                      showToast(`Backed up ${data.succeeded}/${data.total} companies`, data.failed > 0 ? "error" : "success");
                      fetchCompanies();
                    } else {
                      showToast(data.error || "Backup failed", "error");
                    }
                  } catch {
                    showToast("Backup failed", "error");
                  }
                  setLoading(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#3d9a7e] text-white text-sm font-medium rounded-lg hover:bg-[#348a6e] transition-colors"
              >
                <Upload size={14} />
                Backup All
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Restore all companies from their latest backups? This will OVERWRITE current data!")) return;
                  setLoading(true);
                  try {
                    const res = await fetch("/api/backup/bulk-restore", { method: "POST" });
                    const data = await res.json();
                    if (data.success) {
                      showToast(`Restored ${data.succeeded}/${data.total} companies`, data.failed > 0 ? "error" : "success");
                    } else {
                      showToast(data.error || "Restore failed", "error");
                    }
                  } catch {
                    showToast("Restore failed", "error");
                  }
                  setLoading(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RotateCcw size={14} />
                Restore All
              </button>
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 rounded-t-xl">
              <h3 className="text-sm font-semibold text-gray-700">Company Backup Status</h3>
            </div>
            {companiesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#3d9a7e] text-white">
                      <th className="px-4 py-3 text-left font-medium">Company</th>
                      <th className="px-4 py-3 text-left font-medium">Short Code</th>
                      <th className="px-4 py-3 text-left font-medium">Backups</th>
                      <th className="px-4 py-3 text-left font-medium">Total Size</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-center font-medium">Cloud Backup</th>
                      <th className="px-4 py-3 text-left font-medium">Latest Backup</th>
                      <th className="px-4 py-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companiesData.map((company) => (
                      <tr key={company.companyId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{company.companyName}</td>
                        <td className="px-4 py-3 text-gray-600">{company.shortCode || "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{company.totalBackups}</td>
                        <td className="px-4 py-3 text-gray-600">{company.totalSizeFormatted}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            company.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {company.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={async () => {
                              const newValue = !company.cloudEnabled;
                              try {
                                const res = await fetch("/api/backup/companies-toggle", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ companyId: company.companyId, cloudBackupEnabled: newValue }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  showToast(`Cloud backup ${newValue ? "enabled" : "disabled"} for ${company.companyName}`, "success");
                                  fetchCompanies();
                                } else {
                                  showToast(data.error || "Failed to update", "error");
                                }
                              } catch {
                                showToast("Failed to update", "error");
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                              company.cloudEnabled ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              company.cloudEnabled ? "translate-x-6" : "translate-x-1"
                            }`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {company.latestBackupDate
                            ? new Date(company.latestBackupDate).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                              })
                            : "No backups"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={async () => {
                                if (!confirm(`Backup ${company.companyName} now?`)) return;
                                try {
                                  const res = await fetch("/api/backup/bulk", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ companyId: company.companyId }),
                                  });
                                  const data = await res.json();
                                  if (data.success && data.results[0]?.success) {
                                    showToast(`Backup created for ${company.companyName}`, "success");
                                    fetchCompanies();
                                  } else {
                                    showToast(data.results[0]?.error || "Backup failed", "error");
                                  }
                                } catch {
                                  showToast("Backup failed", "error");
                                }
                              }}
                              className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors rounded hover:bg-blue-50"
                              title="Backup Now"
                            >
                              <Upload size={14} />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Restore ${company.companyName} from latest backup? This will OVERWRITE current data!`)) return;
                                try {
                                  const res = await fetch("/api/backup/bulk-restore", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ companyId: company.companyId }),
                                  });
                                  const data = await res.json();
                                  if (data.success && data.results[0]?.success) {
                                    showToast(`${company.companyName} restored successfully`, "success");
                                  } else {
                                    showToast(data.results[0]?.error || "Restore failed", "error");
                                  }
                                } catch {
                                  showToast("Restore failed", "error");
                                }
                              }}
                              className="p-1.5 text-orange-500 hover:text-orange-700 transition-colors rounded hover:bg-orange-50"
                              title="Restore"
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-gray-500 text-center py-8">
                  {loading ? "Loading companies..." : "No companies found. Create a company via User Creation first."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cloud Storage Tab */}
      {activeTab === "cloud" && (
        <div className="space-y-6">
          {/* Cloud Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Cloud Storage Configuration</h3>
              <button
                onClick={fetchCloudStatus}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cloud size={20} className={cloudStatus?.enabled ? "text-[#3d9a7e]" : "text-gray-400"} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Cloud Backup</p>
                    <p className="text-xs text-gray-500">
                      {cloudStatus?.enabled ? "Enabled via R2/S3" : "Not configured"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cloudStatus?.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cloudStatus?.enabled ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <HardDrive size={20} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Backups in Cloud</p>
                    <p className="text-xs text-gray-500">Files stored in cloud storage</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {cloudStatus?.totalBackups ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Storage Usage</p>
                    <p className="text-xs text-gray-500">
                      {cloudStatus?.storageUsedFormatted ?? "0 B"} of {cloudStatus?.storageTotalFormatted ?? "10 GB"}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {storagePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Cloud Backup List */}
          {cloudStatus && cloudStatus.backups.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 rounded-t-xl">
                <h3 className="text-sm font-semibold text-gray-700">Cloud Backup Files</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#3d9a7e] text-white">
                      <th className="px-4 py-3 text-left font-medium">Backup Name</th>
                      <th className="px-4 py-3 text-left font-medium">File</th>
                      <th className="px-4 py-3 text-left font-medium">Size</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cloudStatus.backups.map((backup) => (
                      <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{backup.backupName}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{backup.fileName}</td>
                        <td className="px-4 py-3 text-gray-600">{backup.fileSizeFormatted}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(backup.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/api/backup/${backup.id}`}
                              className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                              title="Download"
                            >
                              <Download size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteCloudBackup(backup.id)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Cloud size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No cloud backups found</p>
              <p className="text-gray-400 text-xs mt-1">
                Create a backup first, then upload it to cloud storage
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#3d9a7e]" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      )}
    </div>
  );
}
