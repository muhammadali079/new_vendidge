"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Settings,
  Save,
  X,
  Printer,
  Shield,
  Loader2,
  Briefcase,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";

const PERM_GROUPS = [
  {
    id: "access",
    title: "Agency Authorities",
    icon: Shield,
    fields: [
      { id: "can_view_invoice", label: "Invoice: View" },
      { id: "can_create_invoice", label: "Invoice: Create" },
      { id: "can_edit_invoice", label: "Invoice: Edit" },
      { id: "can_delete_invoice", label: "Invoice: Delete" },
      { id: "can_post_invoice", label: "Invoice: Post FBR" },
      { id: "can_view_product", label: "Product: View" },
      { id: "can_edit_product", label: "Product: Edit" },
      { id: "can_create_product", label: "Product: Create" },
      { id: "can_delete_product", label: "Product: Delete" },
      { id: "can_view_customer", label: "Customer: View" },
      { id: "can_edit_customer", label: "Customer: Edit" },
      { id: "can_create_customer", label: "Customer: Create" },
      { id: "can_delete_customer", label: "Customer: Delete" },
    ],
  },
  {
    id: "editing",
    title: "Field Constraints",
    icon: Settings,
    fields: [
      { id: "can_edit_single_unit_price", label: "Unit Price" },
      { id: "can_edit_transaction_type", label: "Transaction Type" },
      { id: "can_edit_rate", label: "Tax Rate" },
      { id: "can_edit_retail_price", label: "Retail Price" },
      { id: "can_edit_sro_schedule", label: "SRO Schedule" },
      { id: "can_edit_sro_item", label: "SRO Item" },
      { id: "can_edit_furthur_tax", label: "Further Tax" },
      { id: "can_edit_extra_tax", label: "Extra Tax" },
      { id: "can_edit_sales_tax", label: "Sales Tax" },
      { id: "can_edit_fed_payable", label: "FED Payable" },
      { id: "can_edit_internal_single_unit_price", label: "Internal Price" },
      { id: "can_edit_internal_uom", label: "Internal UoM" },
    ],
  },
  {
    id: "printing",
    title: "Print Layouts",
    icon: Printer,
    fields: [
      { id: "can_edit_print_orientation", label: "Orientation" },
      { id: "can_edit_print_internal_single_unit", label: "Print Int. Price" },
      { id: "can_edit_print_internal_qty", label: "Print Int. Qty" },
      { id: "can_edit_print_retail_price", label: "Print Retail" },
      { id: "can_edit_print_extra_tax", label: "Print Extra Tax" },
      { id: "can_edit_print_furthur_tax", label: "Print Further Tax" },
      { id: "can_edit_print_fed_payable", label: "Print FED" },
      { id: "can_edit_print_sales_tax", label: "Print Sales Tax" },
      { id: "can_edit_print_seller_name", label: "Show Seller Name" },
      { id: "can_edit_print_seller_address", label: "Show Address" },
      { id: "can_edit_print_seller_ntn", label: "Show Seller NTN" },
      { id: "can_edit_print_invoice_date", label: "Show Inv. Date" },
      { id: "can_edit_print_challan_no", label: "Show P.O No" },
      { id: "can_edit_print_challan_date", label: "Show P.O Date" },
    ],
  },
];

export default function AdminConsultantPermPage() {
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState(null);
  const [activeTab, setActiveTab] = useState("access");
  const [success, setSuccess] = useState(false);

  // --- 1. ADD CHANGE TRACKING STATE ---
  const [hasChanges, setHasChanges] = useState(false);

  const adminId =
    typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;

  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        const res = await fetch(
          `/api/consultant_permissions?adminId=${adminId}`,
        );
        const data = await res.json();
        setConsultant(data);
        setEditForm(data);
        setHasChanges(false); // Reset on initial load
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (adminId) fetchConsultant();
  }, [adminId]);

  const handleSave = async () => {
    if (!consultant?.id) {
      alert("Consultant data not loaded correctly.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/consultant_permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId: consultant.id, ...editForm }),
      });

      if (res.ok) {
        setSuccess(true);
        setHasChanges(false); // --- 2. RESET STATE ON SUCCESS ---
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errData = await res.json();
        alert(`Save failed: ${errData.message}`);
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !consultant)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
              Consultant Authority
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500" />
              Direct Control over Hired Tax Agency
            </p>
          </div>
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in zoom-in">
              <CheckCircle2 size={16} /> Permissions Locked
            </div>
          )}
        </div>

        {/* AGENCY CARD */}
        {consultant && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-bl-[10rem] -mr-16 -mt-16" />
            <div className="flex items-center gap-8 relative z-10">
              <div className="h-20 w-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl flex items-center justify-center text-white shadow-2xl">
                <Briefcase size={36} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800">
                  {consultant.name}
                </h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {consultant.ntn}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 uppercase">
                    External Consultant
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg border border-amber-100 uppercase">
                    Revocable Access
                  </span>
                </div>
              </div>
            </div>

            {/* --- 3. CONDITIONAL BUTTON RENDERING --- */}
            {hasChanges && (
              <button
                onClick={handleSave}
                className="relative z-10 bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95 animate-in slide-in-from-right-4 duration-300"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                SYNC AGENCY POLICY
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="flex gap-4 p-8 bg-slate-50 border-b overflow-x-auto">
            {PERM_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveTab(g.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all whitespace-nowrap ${activeTab === g.id ? "bg-blue-600 text-white shadow-xl" : "text-slate-400 hover:bg-white hover:text-slate-600"}`}
              >
                <g.icon size={18} /> {g.title}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scroll bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editForm &&
                PERM_GROUPS.find((g) => g.id === activeTab).fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all group bg-white"
                  >
                    <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">
                      {f.label}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={editForm[f.id] === 1}
                        onChange={(e) => {
                          // --- 4. MARK AS DIRTY ON CHANGE ---
                          setEditForm({
                            ...editForm,
                            [f.id]: e.target.checked ? 1 : 0,
                          });
                          setHasChanges(true);
                        }}
                      />
                      <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                    </label>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
