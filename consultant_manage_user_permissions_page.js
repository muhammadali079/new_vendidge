"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function ClientPermissions() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [changedIds, setChangedIds] = useState(new Set());

  const consultantId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("consultantId") ||
        sessionStorage.getItem("userId")
      : null;

  const loadData = async () => {
    const res = await fetch(
      `/api/consultant/userPermissions?consultantId=${consultantId}`,
    );
    const data = await res.json();
    setAdmins(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (consultantId) loadData();
  }, [consultantId]);

  const handleLocalToggle = (userId, field) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.user_id === userId
          ? { ...admin, [`can_${field}`]: admin[`can_${field}`] === 1 ? 0 : 1 }
          : admin,
      ),
    );
    setChangedIds((prev) => new Set(prev).add(userId));
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
      await loadData();
      setTimeout(() => setSuccess(false), 3000);
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
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">
      {/* COMPACT STICKY HEADER */}
      <div className="sticky top-6 z-30 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">
              Security Deck
            </h1>
            <p
              className="text-[11px] font-bold italic mt-2"
              style={{ color: "#4f46e5" }}
            >
              Sub-User permissions are automatically synced with Admin status on
              save.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase animate-in fade-in zoom-in">
              <CheckCircle2 size={16} /> Permissions Saved
            </div>
          )}
          <button
            onClick={saveAllChanges}
            disabled={saving || changedIds.size === 0}
            className={`px-10 py-3.5 rounded-xl font-black text-xs transition-all flex items-center gap-3 shadow-lg 
                            ${changedIds.size > 0 ? "bg-slate-900 text-white hover:bg-blue-600 hover:scale-[1.02]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            {saving ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Save size={14} />
            )}
            {saving ? "SYNCING..." : `SAVE ${changedIds.size} UPDATES`}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-6">Client Identity</th>
              {["create", "view", "edit", "delete", "post"].map((h) => (
                <th key={h} className="p-6 text-center tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <tr
                key={admin.user_id}
                className={`transition-colors group ${changedIds.has(admin.user_id) ? "bg-amber-50/40" : "hover:bg-slate-50"}`}
              >
                <td className="p-6 flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${changedIds.has(admin.user_id) ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"}`}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 leading-none">
                      {admin.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                      Authorized Admin
                    </p>
                  </div>
                </td>
                {["create", "view", "edit", "delete", "post"].map((f) => (
                  <td key={f} className="p-6 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={admin[`can_${f}`] === 1}
                        onChange={() => handleLocalToggle(admin.user_id, f)}
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-20 text-center text-slate-400 font-bold italic text-sm"
                >
                  No assigned business admins found for this consultant profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
