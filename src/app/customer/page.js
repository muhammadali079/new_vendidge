"use client";

import { useEffect, useState, useCallback } from "react";
import { useUserStore } from "../../store/useUserStore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Users,
  Plus,
  DownloadCloud,
  X,
  Check,
  Trash2,
  MapPin,
  Edit3,
  User,
  Phone,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
        Syncing Customers...
      </p>
    </div>
  );
}

// Updated empty state: business_name is now inside the locations array
const emptyFormState = {
  customer_name: "",
  cnic: "",
  ntn: "",
  strn: "",
  contact: "",
  email: "",
  allowed: true,
  locations: [
    { business_name: "", province_id: 1, province_name: "Punjab", address: "" },
  ],
};

export default function CustomersPage({ darkMode }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [loadingUser, setLoadingUser] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletedLocationIds, setDeletedLocationIds] = useState([]);

  const [form, setForm] = useState(emptyFormState);

  const loadCustomers = useCallback(async () => {
    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));
    try {
      const res = await fetch(`/api/customer?userId=${userId}`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getFbrHeaders = () => {
      const token = sessionStorage.getItem("sellerToken");
      return token
        ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        : { Accept: "application/json" };
    };

    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/fbr/provinces", {
          headers: getFbrHeaders(),
        });
        const json = await res.json();
        setProvinces(json.data || []);
      } catch (err) {
        console.warn(err);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (user) {
      setLoadingUser(false);
      loadCustomers();
    }
  }, [user, loadCustomers]);
  useEffect(() => {
    const isConsultant =
      sessionStorage.getItem("activeConsultantMode") === "true";
    const editId = sessionStorage.getItem("consultantEditCustomerId");

    if (isConsultant && customers.length > 0) {
      // FLOW A: EDIT EXISTING
      if (editId) {
        const target = customers.find(
          (c) => c.id.toString() === editId.toString(),
        );
        if (target) handleEditClick(target); // Uses ACTUAL function from line 133
      }
      // FLOW B: REGISTER NEW
      else {
        setEditingCustomer(null);
        setDeletedLocationIds([]);
        setForm(emptyFormState); // Uses ACTUAL state from line 32
        setShowForm(true);
      }
    }
  }, [customers]);

  // Validation ensures they entered a business name and address for each location
  const canAddMoreLocations = () => {
    return (
      form.locations.length === 0 ||
      form.locations.every(
        (loc) =>
          loc.business_name?.trim() !== "" &&
          loc.province_name &&
          loc.address.trim() !== "",
      )
    );
  };

  const addLocationField = () => {
    if (!canAddMoreLocations()) return;
    setForm((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        { business_name: "", province_id: "", province_name: "", address: "" },
      ],
    }));
  };

  const removeLocationField = (index) => {
    const locationToRemove = form.locations[index];
    if (locationToRemove.id) {
      setDeletedLocationIds((prev) => [...prev, locationToRemove.id]);
    }
    const newLocs = form.locations.filter((_, i) => i !== index);
    if (newLocs.length === 0) {
      newLocs.push({
        business_name: "",
        province_id: "",
        province_name: "",
        address: "",
      });
    }
    setForm((prev) => ({ ...prev, locations: newLocs }));
  };

  const handleLocationChange = (index, field, value) => {
    const newLocs = [...form.locations];
    if (field === "province") {
      const selected = provinces.find((p) => p.stateProvinceDesc === value);
      newLocs[index].province_id = selected?.stateProvinceCode || "";
      newLocs[index].province_name = value;
    } else {
      newLocs[index][field] = value;
    }
    setForm({ ...form, locations: newLocs });
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setDeletedLocationIds([]);
    setForm({
      customer_name: customer.customer_name || "",
      cnic: customer.cnic || "",
      ntn: customer.ntn || "",
      strn: customer.strn || "",
      contact: customer.contact || "",
      email: customer.email || "",
      allowed: customer.allowed,
      locations:
        customer.locations?.length > 0
          ? JSON.parse(JSON.stringify(customer.locations))
          : [
              {
                business_name: "",
                province_id: "",
                province_name: "",
                address: "",
              },
            ],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));
    const finalLocations = form.locations.filter(
      (loc) =>
        loc.business_name.trim() !== "" &&
        loc.province_name &&
        loc.address.trim() !== "",
    );

    if (finalLocations.length === 0)
      return alert(
        "At least one complete location (with Business Name) is required.",
      );

    setLoading(true);
    try {
      const res = await fetch("/api/customer", {
        method: editingCustomer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          id: editingCustomer?.id,
          ...form,
          locations: finalLocations,
          deletedLocationIds,
        }),
      });

      const result = await res.json();
      if (result.success) {
        if (sessionStorage.getItem("activeConsultantMode") === "true") {
          router.push("/consultant/customers"); // Redirect back
        } else {
          setShowForm(false);
          setEditingCustomer(null);
          loadCustomers();
        }
      } else {
        alert(result.error || "Failed to save customer");
      }
    } catch (err) {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (customers.length === 0) return;
    const worksheetData = customers.map((cust) => ({
      "Customer ID": cust.customer_id,
      "Customer Name": cust.customer_name,
      NTN: cust.ntn,
      CNIC: cust.cnic,
      STRN: cust.strn,
      Contact: cust.contact,
      Email: cust.email,
      Status: cust.allowed ? "Allowed" : "Blocked",
      // Joins the business names and addresses cleanly
      Locations: cust.locations
        ?.map((l) => `[${l.business_name}] ${l.province_name}: ${l.address}`)
        .join(" | "),
    }));
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `Customers_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  if (loadingUser) return <Spinner />;

  return (
    <div
      className={`min-h-screen px-4 py-8 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Customers
            </h1>
            <p className="text-slate-500 font-medium">
              Directory of registered clients and tax entities
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <DownloadCloud size={18} /> Export
            </button>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setDeletedLocationIds([]);
                setForm(emptyFormState);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <Plus size={18} /> Add Customer
            </button>
          </div>
        </div>

        {/* --- CUSTOMER LIST SECTION --- */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Users size={18} /> Client Directory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Customer Name</th>
                  <th className="px-4 py-4">Primary Business</th>
                  <th className="px-4 py-4">NTN</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-12 font-bold text-slate-400 uppercase text-xs"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-12 font-bold text-slate-400 uppercase text-xs"
                    >
                      No Customers Found
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-5 font-black text-blue-600 text-xs">
                        #{cust.customer_id}
                      </td>
                      <td className="px-4 py-5 text-slate-800 font-bold">
                        {cust.customer_name || "-"}
                      </td>
                      {/* We show the Business Name of the very first location in the table */}
                      <td className="px-4 py-5 font-medium text-slate-600">
                        {cust.locations?.[0]?.business_name || "-"}
                      </td>
                      <td className="px-4 py-5 font-mono text-xs text-slate-500">
                        {cust.ntn}
                      </td>
                      <td className="px-4 py-5 text-slate-600 text-sm">
                        {cust.contact || "-"}
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${cust.allowed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                        >
                          {cust.allowed ? "Allowed" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <button
                          onClick={() => handleEditClick(cust)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- MODAL FORM --- */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-md bg-slate-900/40 z-50 flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-4xl max-h-full overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b">
              <h2 className="text-2xl font-black text-slate-800">
                {editingCustomer
                  ? `Edit Customer #${editingCustomer.customer_id}`
                  : "Register New Customer"}
              </h2>
              <button
                onClick={() => {
                  if (
                    sessionStorage.getItem("activeConsultantMode") === "true"
                  ) {
                    router.push("/consultant/customers");
                  } else {
                    setShowForm(false);
                  }
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* --- General Details --- */}
              <section>
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User size={16} /> Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={(e) =>
                        setForm({ ...form, customer_name: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Contact Person / Owner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={form.contact}
                      onChange={(e) =>
                        setForm({ ...form, contact: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>
              </section>

              {/* --- Tax Details --- */}
              <section>
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={16} /> Tax & Registration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      NTN Number *
                    </label>
                    <input
                      type="text"
                      value={form.ntn}
                      onChange={(e) =>
                        setForm({ ...form, ntn: e.target.value })
                      }
                      className="w-full p-3 bg-indigo-50/50 border-none rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="7-digit NTN"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      CNIC / Reg No
                    </label>
                    <input
                      type="text"
                      value={form.cnic}
                      onChange={(e) =>
                        setForm({ ...form, cnic: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="13-digit CNIC (Optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      STRN
                    </label>
                    <input
                      type="text"
                      value={form.strn}
                      onChange={(e) =>
                        setForm({ ...form, strn: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border-none rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="STRN (Optional)"
                    />
                  </div>
                </div>
              </section>

              {/* --- LOCATIONS SECTION --- */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} /> Branches & Addresses
                  </h3>
                  <button
                    type="button"
                    disabled={!canAddMoreLocations()}
                    onClick={addLocationField}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                      canAddMoreLocations()
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    <Plus size={14} /> Add Location
                  </button>
                </div>

                <div className="space-y-4">
                  {form.locations.map((loc, idx) => (
                    <div
                      key={loc.id || `new-${idx}`}
                      className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative group shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => removeLocationField(idx)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                            Branch / Business Name *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="e.g. Acme Corp (Lahore Branch)"
                            value={loc.business_name}
                            onChange={(e) =>
                              handleLocationChange(
                                idx,
                                "business_name",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                            Province *
                          </label>
                          <select
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={loc.province_name}
                            onChange={(e) =>
                              handleLocationChange(
                                idx,
                                "province",
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Select Province</option>
                            {provinces.map((p) => (
                              <option
                                key={p.stateProvinceCode}
                                value={p.stateProvinceDesc}
                              >
                                {p.stateProvinceDesc}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                          Full Physical Address *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="Street, Area, City..."
                          value={loc.address}
                          onChange={(e) =>
                            handleLocationChange(idx, "address", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* --- Access / Status Section --- */}
              <section className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Customer Status</h4>
                  <p className="text-xs text-slate-500">
                    Determine if this customer is allowed to be billed.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.allowed}
                    onChange={(e) =>
                      setForm({ ...form, allowed: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-sm font-bold text-slate-700">
                    {form.allowed ? "Allowed" : "Blocked"}
                  </span>
                </label>
              </section>

              {/* --- ACTIONS --- */}
              <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      sessionStorage.getItem("activeConsultantMode") === "true"
                    ) {
                      router.push("/consultant/customers");
                    } else {
                      setShowForm(false);
                    }
                  }}
                  className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {loading ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
