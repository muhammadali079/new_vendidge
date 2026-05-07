"use client";

import { Users, FileText, Activity } from "lucide-react";

export default function ConsultantDashboardDummy() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800">
          Overview
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          High-level metrics across all your assigned clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Active Clients
            </p>
            <p className="text-2xl font-black text-slate-800">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Invoices (This Month)
            </p>
            <p className="text-2xl font-black text-slate-800">348</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total FED / Tax
            </p>
            <p className="text-2xl font-black text-slate-800">Rs 4.2M</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm text-center border-dashed mt-8">
        <h2 className="text-xl font-bold text-slate-400">
          Activity Chart Placeholder
        </h2>
      </div>
    </div>
  );
}
