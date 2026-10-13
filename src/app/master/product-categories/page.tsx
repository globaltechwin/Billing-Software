"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Category = { id: number; name: string; isActive: boolean; createdAt: string; updatedAt: string };

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/product-categories", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.categories)) throw new Error(data.error || "Could not load categories.");
      setCategories(data.categories);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load categories."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/product-categories", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingId ? { id: editingId, name } : { name }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not save category.");
      setName(""); setEditingId(null); setMessage(editingId ? "Category updated." : "Category created."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save category."); }
    finally { setSaving(false); }
  }
  async function toggle(category: Category) {
    setError(""); setMessage("");
    try {
      const response = await fetch("/api/product-categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: category.id, isActive: !category.isActive }) });
      const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error || "Could not update category.");
      setMessage(`Category ${category.isActive ? "deactivated" : "activated"}.`); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update category."); }
  }
  async function remove(category: Category) {
    if (!window.confirm(`Delete category “${category.name}”?`)) return;
    setError(""); setMessage("");
    try { const response = await fetch(`/api/product-categories?id=${category.id}`, { method: "DELETE" }); const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error || "Could not delete category."); setMessage("Category deleted."); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete category."); }
  }
  const visible = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-slate-900">Product Categories</h1><p className="mt-1 text-sm text-slate-500">Manage categories for the currently selected company.</p></div><Link href="/master/product" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to Product Master</Link></div>
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit Category" : "Create Category"}</h2><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row"><div className="flex-1"><label htmlFor="category-name" className="mb-1 block text-sm font-medium text-slate-700">Category Name <span className="text-red-600">*</span></label><input id="category-name" value={name} onChange={e => setName(e.target.value)} maxLength={100} required placeholder="Enter a category relevant to this company" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div className="flex items-end gap-2"><button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : editingId ? "Update Category" : "Add Category"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setName(""); }} className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700">Cancel</button>}</div></form>{message && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}{error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}</section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center"><h2 className="font-semibold text-slate-900">Category List <span className="ml-1 text-sm font-normal text-slate-500">({categories.length})</span></h2><input aria-label="Search categories" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:max-w-xs" /></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-emerald-700 text-white"><tr><th className="px-4 py-3">Category Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Loading categories…</td></tr> : visible.length === 0 ? <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">{search ? "No matching categories." : "No categories created yet. Add your first relevant category above."}</td></tr> : visible.map(c => <tr key={c.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium text-slate-800">{c.name}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{c.isActive ? "Active" : "Inactive"}</span></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => { setEditingId(c.id); setName(c.name); setError(""); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700">Edit</button><button onClick={() => void toggle(c)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">{c.isActive ? "Deactivate" : "Activate"}</button><button onClick={() => void remove(c)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700">Delete</button></div></td></tr>)}</tbody></table></div></section>
  </main>;
}
