"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  User,
  Shield,
  X,
  Edit3,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Calendar,
  ShieldCheck,
} from "lucide-react";

export default function SubConsultantManagement() {
  const [subs, setSubs] = useState([]);
  const [parentData, setParentMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Still need the ID to start the fetch, but metadata comes from API
  const parentId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("consultantId") ||
        sessionStorage.getItem("userId")
      : null;

  const [form, setForm] = useState({
    id: null,
    name: "",
    login_id: "",
    password: "",
    permissions: {
      can_create: 1,
      can_view: 1,
      can_edit: 1,
      can_delete: 1,
      can_post: 1,
    },
  });

  const loadData = async () => {
    try {
      const res = await fetch(
        `/api/consultant/sub-consultant?parentId=${parentId}`,
      );
      const result = await res.json();
      setSubs(result.subs || []);
      setParentMetadata(result.parent || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parentId) loadData();
  }, [parentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      parent_id: parentId,
      domain_name: `${form.login_id}@${parentData?.domain_name?.split("@")[1] || "domain.com"}`,
    };

    const res = await fetch("/api/consultant/sub-consultant", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowModal(false);
      loadData();
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Team Architecture
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 flex items-center gap-2">
            <Shield size={12} className="text-blue-500" /> Authorized
            Sub-Consultants for {parentData?.name || "Portfolio"}
          </p>
        </div>
        <button
          onClick={() => {
            setIsEdit(false);
            setForm({
              name: "",
              login_id: "",
              password: "",
              permissions: {
                can_create: 1,
                can_view: 1,
                can_edit: 1,
                can_delete: 1,
                can_post: 1,
              },
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={20} strokeWidth={3} /> NEW MEMBER
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subs.map((sub) => (
          <div
            key={sub.id}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[6rem] -mr-12 -mt-12 group-hover:bg-blue-100 transition-colors" />

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <User size={32} strokeWidth={2.5} />
              </div>
              <button
                onClick={() => {
                  setIsEdit(true);
                  setForm({
                    id: sub.id,
                    name: sub.name,
                    login_id: sub.domain_name.split("@")[0],
                    permissions: {
                      can_create: sub.can_create_user_invoice,
                      can_view: sub.can_view_user_invoice,
                      can_edit: sub.can_edit_user_invoice,
                      can_delete: sub.can_delete_user_invoice,
                      can_post: sub.can_post_user_invoice,
                    },
                  });
                  setShowModal(true);
                }}
                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent"
              >
                <Edit3 size={18} />
              </button>
            </div>

            <div className="space-y-1 relative z-10">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                {sub.name}
              </h3>
              <div className="flex items-center gap-2 text-blue-600 pt-1">
                <Mail size={12} strokeWidth={3} />
                <span className="font-mono text-[11px] font-black uppercase tracking-wider">
                  {sub.domain_name}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Functional Access
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    key: "can_create_user_invoice",
                    label: "Create",
                    color: "blue",
                  },
                  {
                    key: "can_edit_user_invoice",
                    label: "Edit",
                    color: "indigo",
                  },
                  {
                    key: "can_post_user_invoice",
                    label: "Post FBR",
                    color: "emerald",
                  },
                  {
                    key: "can_delete_user_invoice",
                    label: "Delete",
                    color: "rose",
                  },
                ].map(
                  (perm) =>
                    sub[perm.key] === 1 && (
                      <span
                        key={perm.key}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                          perm.color === "emerald"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : perm.color === "rose"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        <ShieldCheck size={10} strokeWidth={3} /> {perm.label}
                      </span>
                    ),
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={12} />
                <span className="text-[10px] font-black uppercase">
                  Active Since {new Date(sub.created_at).getFullYear()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 uppercase">
                  Live
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL (Keep your existing modal logic but apply the same 'parentData' fix for the domain) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[3rem] w-full max-w-4xl p-10 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-800">
                {isEdit ? "Refine Profile" : "Onboard Member"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 bg-slate-100 text-slate-400 hover:text-rose-500 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    Full Legal Name
                  </label>
                  <input
                    className="w-full p-4 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    System Identity
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-[1.5rem] px-4 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <input
                      className="flex-1 py-4 bg-transparent outline-none font-bold text-blue-600 placeholder:text-slate-300"
                      value={form.login_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          login_id: e.target.value
                            .toLowerCase()
                            .replace(/\s/g, ""),
                        })
                      }
                      required
                      disabled={isEdit}
                      placeholder="username"
                    />
                    <span className="text-slate-400 font-black text-xs lowercase">
                      @{parentData?.domain_name?.split("@")[1] || "domain.com"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Secure Access {isEdit && "(Leave blank to preserve current)"}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full p-4 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required={!isEdit}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-5 top-4 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" />{" "}
                  Policy-Based Permissions
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.keys(form.permissions).map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={form.permissions[key] === 1}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              permissions: {
                                ...form.permissions,
                                [key]: e.target.checked ? 1 : 0,
                              },
                            })
                          }
                        />
                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                        {key.split("_")[1]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-blue-600 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Save size={20} strokeWidth={3} />{" "}
              {isEdit ? "SAVE CHANGES" : "PROVISION ACCOUNT"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
