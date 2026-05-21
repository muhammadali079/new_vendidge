"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Settings,
  Printer,
  Lock,
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// --- PERMISSION GROUPING ---
const PERM_GROUPS = [
  {
    id: "core",
    title: "Core Authority",
    icon: Shield,
    fields: [
      { id: "can_view_invoice", label: "View Invoice" },
      { id: "can_create_invoice", label: "Create Invoice" },
      { id: "can_edit_invoice", label: "Edit Invoice" },
      { id: "can_delete_invoice", label: "Delete Invoice" },
      { id: "can_post_invoice", label: "Post FBR" },
      { id: "can_view_product", label: "View Product" },
      { id: "can_edit_product", label: "Edit Product" },
      { id: "can_create_product", label: "Add Product" },
      { id: "can_delete_product", label: "Delete Product" },
      { id: "can_view_customer", label: "View Customer" },
      { id: "can_edit_customer", label: "Edit Customer" },
      { id: "can_create_customer", label: "Add Customer" },
      { id: "can_delete_customer", label: "Delete Customer" },
    ],
  },
  {
    id: "fields",
    title: "Form Control",
    icon: Settings,
    fields: [
      { id: "can_edit_single_unit_price", label: "Unit Price" },
      { id: "can_edit_transaction_type", label: "Trans. Type" },
      { id: "can_edit_rate", label: "Tax Rate" },
      { id: "can_edit_retail_price", label: "Retail Price" },
      { id: "can_edit_sro_schedule", label: "SRO Schedule" },
      { id: "can_edit_sro_item", label: "SRO Item" },
      { id: "can_edit_furthur_tax", label: "Further Tax" },
      { id: "can_edit_extra_tax", label: "Extra Tax" },
      { id: "can_edit_sales_tax", label: "Sales Tax" },
      { id: "can_edit_fed_payable", label: "FED Payable" },
      { id: "can_edit_internal_single_unit_price", label: "Int. Price" },
      { id: "can_edit_internal_uom", label: "Int. UOM" },
    ],
  },
  {
    id: "print",
    title: "Print Setup",
    icon: Printer,
    fields: [
      { id: "can_edit_print_orientation", label: "Orientation" },
      { id: "can_edit_print_internal_single_unit", label: "Print Int. Price" },
      { id: "can_edit_print_internal_qty", label: "Print Int. Qty" },
      { id: "can_edit_print_retail_price", label: "Print Retail" },
      { id: "can_edit_print_extra_tax", label: "Print Extra" },
      { id: "can_edit_print_furthur_tax", label: "Print Further" },
      { id: "can_edit_print_fed_payable", label: "Print FED" },
      { id: "can_edit_print_sales_tax", label: "Print Sales" },
      { id: "can_edit_print_seller_name", label: "Seller Name" },
      { id: "can_edit_print_seller_address", label: "Seller Address" },
      { id: "can_edit_print_seller_ntn", label: "Seller NTN" },
      { id: "can_edit_print_invoice_date", label: "Inv. Date" },
      { id: "can_edit_print_challan_no", label: "Challan No" },
      { id: "can_edit_print_challan_date", label: "Challan Date" },
    ],
  },
];

export default function SubUserManagement() {
  const [subUsers, setSubUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [activeTab, setActiveTab] = useState("core");

  // Load Admin permissions from sessionStorage
  const adminPerms = JSON.parse(
    typeof window !== "undefined"
      ? sessionStorage.getItem("permissions") || "{}"
      : "{}",
  );
  const isSelfManaged =
    typeof window !== "undefined"
      ? sessionStorage.getItem("user_type") === "self_managed"
      : false;

  const fetchSubUsers = async () => {
    const adminId = sessionStorage.getItem("userId");
    try {
      const res = await fetch(`/api/sub-users?parentId=${adminId}`);
      if (res.ok) setSubUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ ...user, is_active: user.is_active === 1 });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sub-users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        fetchSubUsers();
      }
    } catch (err) {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // Hierarchy Check: Admin can't delegate what they don't have unless self_managed
  const isLockedByHierarchy = (permId) => {
    if (isSelfManaged) return false;
    return adminPerms[permId] === 0;
  };

  if (loading && subUsers.length === 0)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Team Access
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-600" />
              {isSelfManaged
                ? "Full Control Mode"
                : "Restricted Hierarchy Mode"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${user.is_active ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <User size={28} />
                </div>
                <button
                  onClick={() => startEdit(user)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Settings size={20} />
                </button>
              </div>
              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-black text-slate-800">
                  {user.username}
                </h3>
                <p className="font-mono text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  {user.domain_name}
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-1">
                  {user.is_active ? (
                    <CheckCircle size={14} className="text-emerald-500" />
                  ) : (
                    <XCircle size={14} className="text-red-500" />
                  )}
                  <span
                    className={`text-[10px] font-bold ${user.is_active ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECURITY DRAWER */}
      <div
        className={`fixed inset-0 z-50 ${editingId ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity ${editingId ? "opacity-100" : "opacity-0"}`}
          onClick={() => setEditingId(null)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-500 ${editingId ? "translate-x-0" : "translate-x-full"}`}
        >
          {editForm && (
            <div className="flex flex-col h-full">
              <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    Access Control
                  </h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                    {editForm.username}
                  </p>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-3 bg-white rounded-full text-slate-400 shadow-sm hover:text-red-500 transition-colors"
                >
                  <X />
                </button>
              </div>

              <div className="flex gap-4 p-6 bg-white border-b overflow-x-auto">
                {PERM_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveTab(g.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition-all ${activeTab === g.id ? "bg-blue-600 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"}`}
                  >
                    <g.icon size={16} /> {g.title}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scroll">
                {PERM_GROUPS.find((g) => g.id === activeTab).fields.map((f) => {
                  const locked = isLockedByHierarchy(f.id);
                  return (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between p-5 rounded-3xl border ${locked ? "bg-gray-50 border-gray-100 opacity-90 cursor-not-allowed" : "bg-white border-slate-100 hover:border-blue-200 shadow-sm"}`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-black ${locked ? "text-slate-500" : "text-slate-700"}`}
                        >
                          {f.label}
                        </span>
                        {locked && (
                          <span className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-1 mt-1">
                            <Lock size={10} /> Limited by Admin Role
                          </span>
                        )}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          disabled={locked}
                          checked={editForm[f.id] === 1}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              [f.id]: e.target.checked ? 1 : 0,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="p-10 border-t bg-slate-50 flex gap-4">
                <div className="flex items-center gap-3 mr-auto">
                  <span className="text-xs font-black text-slate-500 uppercase">
                    Status:
                  </span>
                  <button
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        is_active: !editForm.is_active,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editForm.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {editForm.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-3"
                >
                  <Save size={18} /> SYNC PERMISSIONS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
