"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { sampleBranches } from "@/components/branch-master/data";
import { ALL_MENU_ITEMS } from "@/lib/menu-config";

interface UserRow {
  id: number;
  username: string;
  name: string;
  email: string;
  mobileNumber: string | null;
  profileImage: string | null;
  isActive: boolean;
  roleId: number;
  roleName: string;
  companyId: number;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
}

interface MenuAccessItem {
  path: string;
  label: string;
  subMenuName: string;
  checked: boolean;
}

const TABLE_TYPES = ["Main Hall", "First Floor", "DINING AREA", "AC Hall", "Terrace", "Take Away", "Home Delivery"];
const PRODUCT_CATEGORIES = ["Cat", "CatEgory TWO", "CAT ONE", "Food", "Beverages"];
const ORDER_TYPES = ["Sales", "Dine In", "Take Away", "Home Delivery"];

export default function UserCreationPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [branch, setBranch] = useState("");
  const [role, setRole] = useState("");
  const [canSettleBill, setCanSettleBill] = useState(true);
  const [canCancelKot, setCanCancelKot] = useState(false);
  const [canViewAllBills, setCanViewAllBills] = useState(true);
  const [canEditBill, setCanEditBill] = useState(false);
  const [selectedTableTypes, setSelectedTableTypes] = useState<string[]>([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([]);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showProfileImage, setShowProfileImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 50;

  // User Access modal
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuModalUser, setMenuModalUser] = useState<UserRow | null>(null);
  const [menuItems, setMenuItems] = useState<MenuAccessItem[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuEntriesPerPage, setMenuEntriesPerPage] = useState(200);
  const [menuCurrentPage, setMenuCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setRoles(data.roles);
      })
      .catch(() => console.error("Failed to fetch roles"));

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setUsers(data.users);
      })
      .catch(() => console.error("Failed to fetch users"));

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.roleName.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + entriesPerPage);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setUserId("");
    setPassword("");
    setCompanyName("");
    setBranch("");
    setRole("");
    setCanSettleBill(true);
    setCanCancelKot(false);
    setCanViewAllBills(true);
    setCanEditBill(false);
    setSelectedTableTypes([]);
    setSelectedProductCategories([]);
    setSelectedOrderTypes([]);
    setEditingId(null);
    setShowProfileImage(false);
    setProfileImageUrl("");
  };

  const handleSave = async () => {
    if (!firstName || !userId || !password || !role) {
      alert("Please fill all required fields");
      return;
    }

    if (!editingId && !companyName.trim()) {
      alert("Company name is required");
      return;
    }

    const body: Record<string, unknown> = {
      username: userId,
      name: `${firstName} ${lastName}`.trim(),
      roleId: Number(role),
    };

    if (password) body.password = password;
    if (!editingId) body.companyName = companyName.trim();

    if (showProfileImage && profileImageUrl.trim()) {
      body.profileImage = profileImageUrl.trim();
    }

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/users` : "/api/users";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit ? { ...body, userId: editingId } : body;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save user");
        return;
      }

      resetForm();
      fetchUsers();
    } catch {
      alert("Failed to save user");
    }
  };

  const handleEdit = (user: UserRow) => {
    setEditingId(user.id);
    const nameParts = user.name.split(" ");
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setUserId(user.username);
    setPassword("");
    setRole(String(user.roleId));
    if (user.profileImage) {
      setShowProfileImage(true);
      setProfileImageUrl(user.profileImage);
    } else {
      setShowProfileImage(false);
      setProfileImageUrl("");
    }
  };

  const handleDelete = async (userId: number, companyId?: number) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const qs = companyId ? `&companyId=${companyId}` : "";
      const res = await fetch(`/api/users?userId=${userId}${qs}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }
      if (data.success) fetchUsers();
    } catch {
      alert("Failed to delete user");
    }
  };

  const toggleActive = async (userId: number, currentActive: boolean, companyId?: number) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isActive: !currentActive,
          companyId: companyId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update user");
        return;
      }
      if (data.success) fetchUsers();
    } catch {
      alert("Failed to update user");
    }
  };

  const toggleListSelection = (
    item: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setProfileImageUrl(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openMenuAccess = async (user: UserRow) => {
    setMenuModalUser(user);
    setShowMenuModal(true);
    setMenuSearch("");
    setMenuLoading(true);
    try {
      const res = await fetch(`/api/user-menu-access?userId=${user.id}&companyId=${user.companyId}`);
      const data = await res.json();
      if (data.success) {
        const items: MenuAccessItem[] = [];
        for (const group of ALL_MENU_ITEMS) {
          if (group.children) {
            for (const child of group.children) {
              const match = data.menuState.find((m: { path: string; allowed: boolean }) => m.path === child.path);
              items.push({
                path: child.path,
                label: group.label,
                subMenuName: child.label,
                checked: match ? match.allowed : true,
              });
            }
          } else {
            const match = data.menuState.find((m: { path: string; allowed: boolean }) => m.path === group.path);
            items.push({
              path: group.path,
              label: group.label,
              subMenuName: group.label,
              checked: match ? match.allowed : true,
            });
          }
        }
        setMenuItems(items);
      }
    } catch {
      console.error("Failed to load menu access");
    } finally {
      setMenuLoading(false);
    }
  };

  const toggleMenuItem = (path: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.path === path ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleAllMenuItems = (checked: boolean) => {
    setMenuItems((prev) => prev.map((item) => ({ ...item, checked })));
  };

  const saveMenuAccess = async () => {
    if (!menuModalUser) return;
    setMenuSaving(true);
    try {
      const blockedPaths = menuItems.filter((item) => !item.checked).map((item) => item.path);
      const res = await fetch("/api/user-menu-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: menuModalUser.id,
          companyId: menuModalUser.companyId,
          blockedPaths,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowMenuModal(false);
        setMenuModalUser(null);
        // Notify sidebar to refresh permissions
        window.dispatchEvent(new Event("billora:permissions-changed"));
      } else {
        alert(data.error || "Failed to save");
      }
    } catch {
      alert("Failed to save menu access");
    } finally {
      setMenuSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* User Creation Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">User Creation</h2>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">First Name *</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Last Name *</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">User ID *</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Password *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          {/* Row 2b - Company Name */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Company Name *</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Ocean View Restaurant"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div />

          {/* Row 3 */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Branch*</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">--Select Branch--</option>
              {sampleBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Role *</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">-- Select Role --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Row 5 */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Can Settle Bill</label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canSettleBill" checked={canSettleBill} onChange={() => setCanSettleBill(true)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canSettleBill" checked={!canSettleBill} onChange={() => setCanSettleBill(false)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Can Cancel KOT</label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canCancelKot" checked={canCancelKot} onChange={() => setCanCancelKot(true)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canCancelKot" checked={!canCancelKot} onChange={() => setCanCancelKot(false)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Row 5 */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Can View All Bills</label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canViewAllBills" checked={canViewAllBills} onChange={() => setCanViewAllBills(true)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canViewAllBills" checked={!canViewAllBills} onChange={() => setCanViewAllBills(false)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Can Edit Bill</label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canEditBill" checked={canEditBill} onChange={() => setCanEditBill(true)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="canEditBill" checked={!canEditBill} onChange={() => setCanEditBill(false)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Row 6 - Table Type */}
          <div className="flex flex-wrap items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0 pt-2">Table Type</label>
            <select multiple value={selectedTableTypes}
              onChange={(e) => setSelectedTableTypes(Array.from(e.target.selectedOptions, (o) => o.value))}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[120px]">
              <option value="" disabled>--Select Table Type--</option>
              {TABLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div /> {/* empty cell to keep alignment */}

          {/* Row 7 - Product Categories & Order Type */}
          <div className="flex flex-wrap items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0 pt-2">Product Categories</label>
            <select multiple value={selectedProductCategories}
              onChange={(e) => setSelectedProductCategories(Array.from(e.target.selectedOptions, (o) => o.value))}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[120px]">
              <option value="" disabled>--Select Category--</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0 pt-2">Order Type</label>
            <select multiple value={selectedOrderTypes}
              onChange={(e) => setSelectedOrderTypes(Array.from(e.target.selectedOptions, (o) => o.value))}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[120px]">
              <option value="" disabled>--Select Order Type--</option>
              {ORDER_TYPES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Row 8 - Profile Image */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0">Profile Image</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowProfileImage(!showProfileImage);
                  if (showProfileImage) setProfileImageUrl("");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showProfileImage ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showProfileImage ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
              <span className="text-sm text-gray-600">{showProfileImage ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
          <div />
          {showProfileImage && (
            <>
              <div className="flex flex-wrap items-start gap-4">
                <label className="text-sm font-medium text-gray-700 w-32 text-right shrink-0 pt-2">Upload Image</label>
                <div className="flex-1 flex items-center gap-4">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-32 h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : profileImageUrl
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : profileImageUrl ? (
                      <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <span className="text-xs text-gray-500 text-center px-1">Drop image or click</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {profileImageUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileImageUrl("")}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3">
          <button onClick={handleSave}
            className="px-8 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
            {editingId ? "Update" : "Save"}
          </button>
          <button onClick={resetForm}
            className="px-8 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">User List</h2>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center justify-end gap-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input type="text" value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">ACTIONS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PHOTO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">USERNAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">ROLE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CREATED</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">USER ACCESS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">No users found</td></tr>
              ) : (
                paginatedUsers.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(row)} className="text-blue-500 hover:text-blue-700 text-xs underline">Edit</button>
                        <span className="text-gray-400">/</span>
                        <button onClick={() => handleDelete(row.id, row.companyId)} className="text-red-500 hover:text-red-700 text-xs underline">Delete</button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center mx-auto">
                        {row.profileImage ? (
                          <img src={row.profileImage} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{row.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{row.roleName}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(row.id, row.isActive, row.companyId)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          row.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}>
                        {row.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {new Date(row.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openMenuAccess(row)}
                        className="px-3 py-1.5 bg-[#7c5cbf] text-white text-xs font-medium rounded hover:bg-[#6a4fa8] transition-colors"
                      >
                        User Access
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredUsers.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Previous</button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Menu Details Modal */}
      {showMenuModal && menuModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMenuModal(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menu Details</h2>
              <button onClick={() => setShowMenuModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 flex items-center justify-between gap-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={menuEntriesPerPage}
                  onChange={(e) => { setMenuEntriesPerPage(Number(e.target.value)); setMenuCurrentPage(1); }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => { setMenuSearch(e.target.value); setMenuCurrentPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              {menuLoading ? (
                <div className="p-8 text-center text-sm text-gray-500">Loading menu access...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#3d9a7e] text-white">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">
                        <input
                          type="checkbox"
                          checked={menuItems.length > 0 && menuItems.every((m) => m.checked)}
                          onChange={(e) => toggleAllMenuItems(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">MENU NAME</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">SUBMENU NAME</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = menuItems.filter((item) => {
                        if (!menuSearch) return true;
                        const q = menuSearch.toLowerCase();
                        return (
                          item.label.toLowerCase().includes(q) ||
                          item.subMenuName.toLowerCase().includes(q)
                        );
                      });
                      const menuStart = (menuCurrentPage - 1) * menuEntriesPerPage;
                      const paginated = filtered.slice(menuStart, menuStart + menuEntriesPerPage);

                      if (paginated.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                              No menu items found
                            </td>
                          </tr>
                        );
                      }

                      return paginated.map((item) => (
                        <tr key={item.path} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleMenuItem(item.path)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-700">{item.label}</td>
                          <td className="px-4 py-3 text-gray-700">{item.subMenuName}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.checked ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {item.checked ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {menuItems.filter((item) => {
                  if (!menuSearch) return true;
                  const q = menuSearch.toLowerCase();
                  return item.label.toLowerCase().includes(q) || item.subMenuName.toLowerCase().includes(q);
                }).length > 0 ? (menuCurrentPage - 1) * menuEntriesPerPage + 1 : 0} to{" "}
                {Math.min(
                  menuCurrentPage * menuEntriesPerPage,
                  menuItems.filter((item) => {
                    if (!menuSearch) return true;
                    const q = menuSearch.toLowerCase();
                    return item.label.toLowerCase().includes(q) || item.subMenuName.toLowerCase().includes(q);
                  }).length
                )} of{" "}
                {menuItems.filter((item) => {
                  if (!menuSearch) return true;
                  const q = menuSearch.toLowerCase();
                  return item.label.toLowerCase().includes(q) || item.subMenuName.toLowerCase().includes(q);
                }).length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMenuCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={menuCurrentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const totalFiltered = menuItems.filter((item) => {
                      if (!menuSearch) return true;
                      const q = menuSearch.toLowerCase();
                      return item.label.toLowerCase().includes(q) || item.subMenuName.toLowerCase().includes(q);
                    }).length;
                    const totalPages = Math.ceil(totalFiltered / menuEntriesPerPage);
                    setMenuCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  disabled={menuCurrentPage >= Math.ceil(
                    menuItems.filter((item) => {
                      if (!menuSearch) return true;
                      const q = menuSearch.toLowerCase();
                      return item.label.toLowerCase().includes(q) || item.subMenuName.toLowerCase().includes(q);
                    }).length / menuEntriesPerPage
                  ) || menuItems.length === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowMenuModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveMenuAccess}
                disabled={menuSaving}
                className="px-4 py-2 bg-[#7c5cbf] text-white text-sm font-medium rounded-lg hover:bg-[#6a4fa8] transition-colors disabled:opacity-50"
              >
                {menuSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
