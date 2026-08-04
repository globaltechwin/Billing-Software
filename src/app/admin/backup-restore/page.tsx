"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  HardDrive,
  Cloud,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface BackupSetting {
  autoBackupEnabled: boolean;
  backupTime: string;
  retentionDays: number;
  cloudBackupEnabled: boolean;
  compression: boolean;
  encryption: boolean;
  encryptionKey: string;
}

interface BackupRecord {
  id: number;
  backupName: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  storageType: string;
  cloudPath: string | null;
  status: string;
  compression: boolean;
  encrypted: boolean;
  tableCount: number;
  recordCount: number;
  error: string | null;
  createdBy: string;
  createdAt: string;
}

interface RestoreRecord {
  id: number;
  backupName: string;
  restoredAt: string;
  restoredBy: string;
  status: string;
  error: string | null;
}

interface DashboardData {
  setting: BackupSetting;
  totalBackups: number;
  completedBackups: number;
  failedBackups: number;
  lastBackup: {
    id: number;
    backupName: string;
    createdAt: string;
    fileSize: number;
    fileSizeFormatted: string;
  } | null;
  totalSize: number;
  totalSizeFormatted: string;
  recentLogs: {
    id: number;
    step: string;
    message: string;
    status: string;
    createdAt: string;
  }[];
}

type TabId = "dashboard" | "history" | "restore" | "settings";

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}


function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle size={16} className="text-green-500" />;
    case "RUNNING":
      return <Loader2 size={16} className="text-blue-500 animate-spin" />;
    case "FAILED":
      return <XCircle size={16} className="text-red-500" />;
    case "PENDING":
      return <Clock size={16} className="text-gray-400" />;
    default:
      return <Clock size={16} className="text-gray-400" />;
  }
}

export default function BackupRestorePage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<BackupRecord[]>([]);
  const [restoreHistory, setRestoreHistory] = useState<RestoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [settings, setSettings] = useState<BackupSetting>({
    autoBackupEnabled: false,
    backupTime: "02:00",
    retentionDays: 30,
    cloudBackupEnabled: false,
    compression: true,
    encryption: false,
    encryptionKey: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [cloudUploading, setCloudUploading] = useState<number | null>(null);
  const [searchHistory, setSearchHistory] = useState("");
  const [searchRestoreHistory, setSearchRestoreHistory] = useState("");

  useEffect(() => {
    fetch("/api/backup?type=dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load dashboard"))))
      .then((data) => {
        if (data.success && data.dashboard) {
          setDashboard(data.dashboard);
          if (data.dashboard.setting) {
            setSettings({
              autoBackupEnabled: data.dashboard.setting.autoBackupEnabled ?? false,
              backupTime: data.dashboard.setting.backupTime ?? "02:00",
              retentionDays: data.dashboard.setting.retentionDays ?? 30,
              cloudBackupEnabled: data.dashboard.setting.cloudBackupEnabled ?? false,
              compression: data.dashboard.setting.compression ?? true,
              encryption: data.dashboard.setting.encryption ?? false,
              encryptionKey: data.dashboard.setting.encryptionKey ?? "",
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchDashboard = useCallback(() => {
    fetch("/api/backup?type=dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.success && data.dashboard) {
          setDashboard(data.dashboard);
        }
      })
      .catch(() => {});
  }, []);

  const fetchHistory = useCallback(() => {
    fetch("/api/backup?type=history")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.success && Array.isArray(data.history)) {
          setHistory(data.history);
        }
      })
      .catch(() => {});
  }, []);

  const fetchRestoreHistory = useCallback(() => {
    fetch("/api/backup/restore")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.success && Array.isArray(data.history)) {
          setRestoreHistory(data.history);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    } else if (activeTab === "restore") {
      fetchRestoreHistory();
    } else if (activeTab === "dashboard") {
      fetchDashboard();
    }
  }, [activeTab, fetchHistory, fetchRestoreHistory, fetchDashboard]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);

  const handleCreateBackup = useCallback(() => {
    if (creatingBackup) return;
    setCreatingBackup(true);
    fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "manual" }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create backup");
        showToast("Backup created successfully");
        fetchDashboard();
        if (activeTab === "history") fetchHistory();
      })
      .catch((err: Error) => showToast(err.message || "Failed to create backup"))
      .finally(() => setCreatingBackup(false));
  }, [creatingBackup, showToast, fetchDashboard, fetchHistory, activeTab]);

  const handleDownload = useCallback((id: number, name: string) => {
    window.open(`/api/backup/${id}?download=true`, "_blank");
    showToast(`Downloading ${name}`);
  }, [showToast]);

  const handleCloudUpload = useCallback((id: number) => {
    if (cloudUploading !== null) return;
    setCloudUploading(id);
    fetch(`/api/backup/cloud`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupId: id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload to cloud");
        showToast("Uploaded to cloud successfully");
        fetchHistory();
      })
      .catch((err: Error) => showToast(err.message || "Failed to upload to cloud"))
      .finally(() => setCloudUploading(null));
  }, [cloudUploading, showToast, fetchHistory]);

  const handleDelete = useCallback((id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete backup "${name}"? This cannot be undone.`)) return;
    fetch(`/api/backup/${id}`, { method: "DELETE" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete backup");
        showToast("Backup deleted successfully");
        fetchHistory();
        fetchDashboard();
      })
      .catch((err: Error) => showToast(err.message || "Failed to delete backup"));
  }, [showToast, fetchHistory, fetchDashboard]);

  const handleRestoreFromHistory = useCallback((id: number, name: string) => {
    if (!confirm(`Are you sure you want to restore from "${name}"? This will overwrite the current database.`)) return;
    setRestoring(true);
    fetch("/api/backup/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupId: id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Restore failed");
        showToast("Restore completed successfully");
        fetchRestoreHistory();
      })
      .catch((err: Error) => showToast(err.message || "Restore failed"))
      .finally(() => setRestoring(false));
  }, [showToast, fetchRestoreHistory]);

  const handleFileRestore = useCallback(() => {
    if (!restoreFile) {
      alert("Please select a file to restore");
      return;
    }
    if (!confirm("Are you sure you want to restore from this file? This will overwrite the current database.")) return;
    setRestoring(true);
    const formData = new FormData();
    formData.append("file", restoreFile);
    fetch("/api/backup/restore", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Restore failed");
        showToast("Restore completed successfully");
        setRestoreFile(null);
        fetchRestoreHistory();
      })
      .catch((err: Error) => showToast(err.message || "Restore failed"))
      .finally(() => setRestoring(false));
  }, [restoreFile, showToast, fetchRestoreHistory]);

  const handleSaveSettings = useCallback(() => {
    setSavingSettings(true);
    fetch("/api/backup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save settings");
        showToast("Settings saved successfully");
      })
      .catch((err: Error) => showToast(err.message || "Failed to save settings"))
      .finally(() => setSavingSettings(false));
  }, [settings, showToast]);

  const filteredHistory = history.filter((r) => {
    if (!searchHistory) return true;
    const q = searchHistory.toLowerCase();
    return (
      r.backupName.toLowerCase().includes(q) ||
      r.fileName.toLowerCase().includes(q) ||
      r.storageType.toLowerCase().includes(q)
    );
  });

  const filteredRestoreHistory = restoreHistory.filter((r) => {
    if (!searchRestoreHistory) return true;
    const q = searchRestoreHistory.toLowerCase();
    return (
      r.backupName.toLowerCase().includes(q) ||
      (r.restoredBy && r.restoredBy.toLowerCase().includes(q))
    );
  });

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Database size={16} /> },
    { id: "history", label: "Backup History", icon: <Clock size={16} /> },
    { id: "restore", label: "Restore", icon: <Upload size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toastMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && dashboard && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "TOTAL BACKUPS", value: dashboard.totalBackups, icon: <Database size={20} />, iconBg: "bg-blue-50", iconColor: "#3b82f6" },
                  { label: "COMPLETED", value: dashboard.completedBackups, icon: <CheckCircle size={20} />, iconBg: "bg-green-50", iconColor: "#22c55e" },
                  { label: "FAILED", value: dashboard.failedBackups, icon: <XCircle size={20} />, iconBg: "bg-red-50", iconColor: "#ef4444" },
                  { label: "STORAGE USED", value: dashboard.totalSizeFormatted, icon: <HardDrive size={20} />, iconBg: "bg-purple-50", iconColor: "#8b5cf6" },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                        <span style={{ color: card.iconColor }}>{card.icon}</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{card.label}</div>
                        <div className="text-xl font-bold text-gray-800">{card.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Backup Button + Last Backup Info */}
              <div className="flex items-center justify-between">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-1 mr-4">
                  <div className="text-sm font-semibold text-gray-800 mb-1">Last Backup</div>
                  {dashboard.lastBackup ? (
                    <div className="text-sm text-gray-600">
                      {dashboard.lastBackup.backupName} &mdash; {formatDateTime(dashboard.lastBackup.createdAt)} &mdash; {dashboard.lastBackup.fileSizeFormatted}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No backups yet</div>
                  )}
                </div>
                <button
                  onClick={handleCreateBackup}
                  disabled={creatingBackup}
                  className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {creatingBackup ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {creatingBackup ? "Creating..." : "Create Backup Now"}
                </button>
              </div>

              {/* Recent Logs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800">Recent Logs</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#3d9a7e] text-white">
                        <th className="px-4 py-3 text-center text-xs font-semibold">STEP</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">MESSAGE</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                            No recent logs
                          </td>
                        </tr>
                      ) : (
                        dashboard.recentLogs.map((log) => (
                          <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{log.step}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{log.message}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <StatusIcon status={log.status} />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{formatDateTime(log.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {creatingBackup ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {creatingBackup ? "Creating..." : "New Backup"}
                  </button>
                  <button
                    onClick={fetchHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.value)}
                    placeholder="Search backups..."
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead>
                      <tr className="bg-[#3d9a7e] text-white">
                        <th className="px-4 py-3 text-center text-xs font-semibold">BACKUP NAME</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">DATE</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">SIZE</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">TABLES</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">STORAGE</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                            No backups found
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((row) => (
                          <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">
                              <div className="flex items-center justify-center gap-2">
                                <FileText size={14} className="text-gray-400" />
                                {row.backupName}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{formatDateTime(row.createdAt)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.fileSizeFormatted}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.tableCount}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <div className="flex items-center justify-center gap-1">
                                <StatusIcon status={row.status} />
                                <span className={`text-xs font-medium ${
                                  row.status === "COMPLETED" ? "text-green-600" :
                                  row.status === "RUNNING" ? "text-blue-600" :
                                  row.status === "FAILED" ? "text-red-600" :
                                  "text-gray-500"
                                }`}>
                                  {row.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {row.storageType === "CLOUD" ? <Cloud size={14} className="text-blue-500" /> : <HardDrive size={14} className="text-gray-500" />}
                                {row.storageType}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleDownload(row.id, row.backupName)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Download"
                                >
                                  <Download size={14} />
                                </button>
                                <button
                                  onClick={() => handleRestoreFromHistory(row.id, row.backupName)}
                                  disabled={restoring || row.status !== "COMPLETED"}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                  title="Restore"
                                >
                                  <Upload size={14} />
                                </button>
                                {settings.cloudBackupEnabled && row.storageType !== "CLOUD" && row.status === "COMPLETED" && (
                                  <button
                                    onClick={() => handleCloudUpload(row.id)}
                                    disabled={cloudUploading === row.id}
                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                                    title="Upload to Cloud"
                                  >
                                    {cloudUploading === row.id ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(row.id, row.backupName)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Restore Tab */}
          {activeTab === "restore" && (
            <div className="space-y-6">
              {/* Warning Banner */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-red-800">Warning: Database Restore</div>
                  <div className="text-sm text-red-600 mt-1">
                    Restoring a backup will <strong>permanently overwrite</strong> all current data. This action cannot be undone.
                    Make sure you have a recent backup before proceeding.
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800">Restore from File</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".sql,.sql.gz,.sql.gz.enc,.enc"
                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer"
                      />
                      <div className="text-xs text-gray-400 mt-1">Accepted: .sql, .sql.gz, .sql.gz.enc, .enc</div>
                    </div>
                    <button
                      onClick={handleFileRestore}
                      disabled={restoring || !restoreFile}
                      className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {restoring ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {restoring ? "Restoring..." : "Restore"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Restore History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">Restore History</h2>
                  <input
                    type="text"
                    value={searchRestoreHistory}
                    onChange={(e) => setSearchRestoreHistory(e.target.value)}
                    placeholder="Search..."
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#3d9a7e] text-white">
                        <th className="px-4 py-3 text-center text-xs font-semibold">BACKUP NAME</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">RESTORED AT</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">RESTORED BY</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRestoreHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                            No restore history found
                          </td>
                        </tr>
                      ) : (
                        filteredRestoreHistory.map((row) => (
                          <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.backupName}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{formatDateTime(row.restoredAt)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.restoredBy || "-"}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <div className="flex items-center justify-center gap-1">
                                <StatusIcon status={row.status} />
                                <span className={`text-xs font-medium ${
                                  row.status === "COMPLETED" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {row.status}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800">Backup Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Toggle Row: Auto Backup + Cloud Backup */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Auto Backup</div>
                        <div className="text-xs text-gray-500 mt-0.5">Automatically create daily backups</div>
                      </div>
                      <button
                        onClick={() => setSettings((s) => ({ ...s, autoBackupEnabled: !s.autoBackupEnabled }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings.autoBackupEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            settings.autoBackupEnabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Cloud Backup</div>
                        <div className="text-xs text-gray-500 mt-0.5">Upload backups to cloud storage</div>
                      </div>
                      <button
                        onClick={() => setSettings((s) => ({ ...s, cloudBackupEnabled: !s.cloudBackupEnabled }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings.cloudBackupEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            settings.cloudBackupEnabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Toggle Row: Compression + Encryption */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Compression</div>
                        <div className="text-xs text-gray-500 mt-0.5">Compress backup files to save storage</div>
                      </div>
                      <button
                        onClick={() => setSettings((s) => ({ ...s, compression: !s.compression }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings.compression ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            settings.compression ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Encryption</div>
                        <div className="text-xs text-gray-500 mt-0.5">Encrypt backup files for security</div>
                      </div>
                      <button
                        onClick={() => setSettings((s) => ({ ...s, encryption: !s.encryption }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings.encryption ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            settings.encryption ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Backup Time + Retention Days */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Backup Time</label>
                      <input
                        type="time"
                        value={settings.backupTime}
                        onChange={(e) => setSettings((s) => ({ ...s, backupTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Retention Days</label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={settings.retentionDays}
                        onChange={(e) => setSettings((s) => ({ ...s, retentionDays: parseInt(e.target.value) || 30 }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Encryption Key (conditional) */}
                  {settings.encryption && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Encryption Key</label>
                      <input
                        type="password"
                        value={settings.encryptionKey}
                        onChange={(e) => setSettings((s) => ({ ...s, encryptionKey: e.target.value }))}
                        placeholder="Enter encryption key"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {savingSettings ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Save({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
