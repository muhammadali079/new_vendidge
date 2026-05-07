"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Globe,
  Lock,
  BadgeCheck,
} from "lucide-react";

export default function ConsultantProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const consultantId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("consultantId") ||
        sessionStorage.getItem("userId")
      : null;

  const [form, setForm] = useState({
    id: null,
    parent_id: null,
    name: "",
    domain_name: "",
    password: "",
    business_name: "",
    cnic_ntn: "",
    contact: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`/api/consultant/profile?id=${consultantId}`);
      const data = await res.json();
      setForm({ ...data, password: "" });
      setLoading(false);
    };
    if (consultantId) fetchProfile();
  }, [consultantId]);

  // Reactive Domain Logic from Super Admin
  const handleNameChange = (newName) => {
    const cleanSlug = newName.toLowerCase().replace(/\s/g, "");
    setForm({ ...form, name: newName, domain_name: `${cleanSlug}.com` });
    setHasChanged(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/consultant/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccessMsg(true);
      setHasChanged(false);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* CONSOLE HEADER */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {form.business_name || form.name}
              </h1>
              <span className="text-blue-600 font-mono font-bold italic text-sm mt-1">
                admin@{form.domain_name}
              </span>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            disabled={saving || !hasChanged}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg 
              ${hasChanged ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Updating..." : "Update Record"}
          </button>
        </div>

        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* BUSINESS SECTION */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Business Name
              </label>
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                value={form.business_name || ""}
                onChange={(e) => {
                  setForm({ ...form, business_name: e.target.value });
                  setHasChanged(true);
                }}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                CNIC / NTN
              </label>
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold font-mono tracking-widest"
                value={form.cnic_ntn || ""}
                onChange={(e) => {
                  setForm({ ...form, cnic_ntn: e.target.value });
                  setHasChanged(true);
                }}
                required
              />
            </div>

            {/* CONTACT INFO */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Contact Number
              </label>
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                value={form.contact || ""}
                onChange={(e) => {
                  setForm({ ...form, contact: e.target.value });
                  setHasChanged(true);
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Official Email
              </label>
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                value={form.email || ""}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setHasChanged(true);
                }}
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Mailing Address
              </label>
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                value={form.address || ""}
                onChange={(e) => {
                  setForm({ ...form, address: e.target.value });
                  setHasChanged(true);
                }}
              />
            </div>

            {/* IDENTITY SECTION */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Admin Name
              </label>
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                value={form.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Domain Identity
              </label>
              <div className="flex items-center bg-slate-50 rounded-2xl border-2 border-transparent focus-within:border-blue-500 overflow-hidden shadow-inner">
                {/* FIXED PREFIX - FIXED AS PER REQUIREMENT */}
                <span className="pl-4 text-slate-400 font-bold text-sm select-none">
                  admin@
                </span>
                <input
                  className="flex-1 p-4 bg-transparent outline-none font-mono font-bold text-blue-600"
                  value={form.domain_name}
                  onChange={(e) => {
                    setForm({ ...form, domain_name: e.target.value });
                    setHasChanged(true);
                  }}
                  required
                />
              </div>
            </div>

            {/* SECURITY SECTION */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Access Credentials
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold shadow-inner"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setHasChanged(true);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              {/* INDIGO HELPER TEXT FIXED */}
              <p
                className="text-[11px] font-bold italic mt-2 ml-2 text-indigo-600"
                style={{ color: "#4f46e5" }}
              >
                Leave blank to maintain current password.
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-black uppercase text-xs animate-in fade-in zoom-in">
              <CheckCircle2 size={18} />
              <span>Profile Synchronized</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
