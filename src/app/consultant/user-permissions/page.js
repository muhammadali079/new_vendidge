"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Loader2,
  Save,
  CheckCircle2,
  Settings,
  Receipt,
  Package,
  Users,
  Printer,
  X,
  Edit3,
  Lock,
} from "lucide-react";

const PERM_GROUPS = [
  {
    id: "invoices",
    title: "Invoices",
    icon: Receipt,
    fields: [
      { id: "can_view_invoice", label: "View" },
      { id: "can_edit_invoice", label: "Edit" },
      { id: "can_create_invoice", label: "Create" },
      { id: "can_delete_invoice", label: "Delete" },
      { id: "can_post_invoice", label: "Post/Submit" },
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: Package,
    fields: [
      { id: "can_view_product", label: "View" },
      { id: "can_edit_product", label: "Edit" },
      { id: "can_create_product", label: "Create" },
      { id: "can_delete_product", label: "Delete" },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    icon: Users,
    fields: [
      { id: "can_view_customer", label: "View" },
      { id: "can_edit_customer", label: "Edit" },
      { id: "can_create_customer", label: "Create" },
      { id: "can_delete_customer", label: "Delete" },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & Tax",
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
      { id: "can_edit_internal_single_unit_price", label: "Int. Unit Price" },
      { id: "can_edit_internal_uom", label: "Int. UOM" },
    ],
  },
  {
    id: "printing",
    title: "Print Setup",
    icon: Printer,
    fields: [
      { id: "can_edit_print_orientation", label: "Orientation" },
      { id: "can_edit_print_internal_single_unit", label: "Int. Price" },
      { id: "can_edit_print_internal_qty", label: "Int. Qty" },
      { id: "can_edit_print_retail_price", label: "Retail Price" },
      { id: "can_edit_print_extra_tax", label: "Extra Tax" },
      { id: "can_edit_print_furthur_tax", label: "Further Tax" },
      { id: "can_edit_print_fed_payable", label: "FED" },
      { id: "can_edit_print_sales_tax", label: "Sales Tax" },
      { id: "can_edit_print_seller_name", label: "Seller Name" },
      { id: "can_edit_print_seller_address", label: "Address" },
      { id: "can_edit_print_seller_ntn", label: "NTN" },
      { id: "can_edit_print_invoice_date", label: "Date" },
      { id: "can_edit_print_challan_no", label: "Challan #" },
      { id: "can_edit_print_challan_date", label: "Challan Date" },
    ],
  },
];

export default function SecurityDeck() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [changedIds, setChangedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [activeAdmin, setActiveAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("invoices");

  const consultantId =
    typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;
  const myPerms = JSON.parse(
    typeof window !== "undefined"
      ? sessionStorage.getItem("permissions") || "{}"
      : "{}",
  );

  const loadData = async () => {
    try {
      const res = await fetch(
        `/api/consultant/userPermissions?consultantId=${consultantId}`,
      );
      const data = await res.json();
      console.log("user data ", data);
      setAdmins(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (consultantId) loadData();
  }, [consultantId]);

  const handleToggle = (fieldId, checked) => {
    const val = checked ? 1 : 0;
    setAdmins((prev) =>
      prev.map((a) =>
        a.user_id === activeAdmin.user_id ? { ...a, [fieldId]: val } : a,
      ),
    );
    setActiveAdmin((prev) => ({ ...prev, [fieldId]: val }));
    setChangedIds((prev) => new Set(prev).add(activeAdmin.user_id));
  };

  const saveAllChanges = async () => {
    setSaving(true);
    const updates = admins.filter((a) => changedIds.has(a.user_id));
    const res = await fetch("/api/consultant/userPermissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    if (res.ok) {
      setSuccess(true);
      setChangedIds(new Set());
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="sticky top-6 z-30 flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Security Decks
            </h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
              Managed Client Policies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <div className="text-emerald-600 font-black text-xs animate-in fade-in zoom-in">
              SYNCED
            </div>
          )}
          <button
            onClick={saveAllChanges}
            disabled={saving || changedIds.size === 0}
            className={`px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 transition-all ${changedIds.size > 0 ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            SAVE {changedIds.size} UPDATES
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {admins.map((admin) => (
          <div
            key={admin.user_id}
            onClick={() => {
              setActiveAdmin(admin);
              setShowModal(true);
            }}
            className={`bg-white p-10 rounded-[3rem] border-2 cursor-pointer transition-all relative group ${changedIds.has(admin.user_id) ? "border-amber-200 bg-amber-50/20" : "border-slate-100 hover:border-blue-400 shadow-sm hover:shadow-xl"}`}
          >
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Building2 size={28} />
            </div>
            <h3 className="font-black text-2xl text-slate-800 leading-none">
              {admin.business_name || admin.name}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
              Client Identity
            </p>
            <div className="absolute top-10 right-10 text-slate-300 group-hover:text-blue-500 transition-colors">
              <Edit3 size={24} />
            </div>
            {changedIds.has(admin.user_id) && (
              <div className="mt-8 pt-6 border-t border-amber-100 flex items-center gap-2">
                <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-amber-600 uppercase">
                  Pending Sync
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && activeAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-12 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black text-slate-800">
                  {activeAdmin.business_name || activeAdmin.name}
                </h2>
                <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-2 flex items-center gap-2">
                  <ShieldCheck size={16} /> Access Policy
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-4 hover:bg-white rounded-full transition-all border border-slate-100"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-72 bg-slate-50 p-8 border-r flex flex-col gap-3">
                {PERM_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveTab(g.id)}
                    className={`flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black text-xs transition-all ${activeTab === g.id ? "bg-blue-600 text-white shadow-2xl" : "text-slate-500 hover:bg-white"}`}
                  >
                    <g.icon size={20} /> {g.title}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-12 overflow-y-auto">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {PERM_GROUPS.find((g) => g.id === activeTab).fields.map(
                    (f) => {
                      const isAllowed = myPerms[f.id] == 1;
                      return (
                        <div
                          key={f.id}
                          className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all ${isAllowed ? "border-slate-100 hover:border-blue-200 bg-white" : "bg-slate-100 grayscale opacity-40 cursor-not-allowed"}`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-black text-slate-800">
                              {f.label}
                            </span>
                            {!isAllowed && (
                              <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1">
                                <Lock size={10} /> Agency Restricted
                              </span>
                            )}
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              disabled={!isAllowed}
                              checked={activeAdmin[f.id] == 1}
                              onChange={(e) =>
                                handleToggle(f.id, e.target.checked)
                              }
                            />
                            <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                          </label>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
            <div className="p-12 border-t bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-900 text-white px-16 py-5 rounded-2xl font-black text-sm shadow-2xl"
              >
                Close & Queue Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
