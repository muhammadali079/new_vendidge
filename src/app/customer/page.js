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
  ChevronDown,
  Edit3,
  User,
  Phone,
  FileText,
  ShieldAlert,
  Eye,
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

const emptyFormState = {
  customer_name: "",
  cnic: "",
  ntn: "",
  strn: "",
  contact: "",
  email: "",
  allowed: true,
  locations: [
    { business_name: "", province_id: 0, province_name: "", address: "" },
  ],
};

export default function CustomersPage({ darkMode }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // --- 1. PERMISSION STATES ---
  const [perms, setPerms] = useState({});
  const [isSelfManaged, setIsSelfManaged] = useState(false);
  const [isFormReadOnly, setIsFormReadOnly] = useState(false); // Controls input lock

  useEffect(() => {
    const storedPerms = JSON.parse(
      sessionStorage.getItem("permissions") || "{}",
    );
    const type = sessionStorage.getItem("user_type");
    setPerms(storedPerms);
    setIsSelfManaged(type === "self_managed");
  }, []);

  const [loadingUser, setLoadingUser] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletedLocationIds, setDeletedLocationIds] = useState([]);
  const [form, setForm] = useState(emptyFormState);

  const loadCustomers = useCallback(async () => {
    if (perms.can_view_customer === 0) {
      setLoading(false);
      return;
    }
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
  }, [perms.can_view_customer]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const token = sessionStorage.getItem("sellerToken");
      const headers = token
        ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        : { Accept: "application/json" };
      try {
        const res = await fetch("/api/fbr/provinces", { headers });
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

    // Only run once the customer list has actually loaded from the DB
    if (isConsultant) {
      if (editId) {
        // FLOW A: CONSULTANT EDIT/VIEW
        const target = customers.find(
          (c) => c.id.toString() === editId.toString(),
        );
        if (target) {
          handleOpenForm(target); // This now checks perms.can_edit_customer automatically
        }
      } else {
        // FLOW B: CONSULTANT REGISTER NEW
        handleOpenForm(null); // This now checks perms.can_create_customer automatically
      }
    }
  }, [customers]); // Depend on customers list being ready

  // --- 2. FORM ACTION LOGIC ---
  // const handleOpenForm = (customer = null) => {
  //   if (customer) {
  //     // Existing Customer: Always open if view=1, but check edit perm
  //     setEditingCustomer(customer);
  //     setIsFormReadOnly(perms.can_edit_customer === 0);
  //     setForm({
  //       ...customer,
  //       locations:
  //         customer.locations?.length > 0
  //           ? JSON.parse(JSON.stringify(customer.locations))
  //           : [emptyFormState.locations[0]],
  //     });
  //   } else {
  //     // New Customer: Open if create=1
  //     if (perms.can_create_customer === 0) return;
  //     setEditingCustomer(null);
  //     setIsFormReadOnly(false);
  //     setForm(emptyFormState);
  //   }
  //   setDeletedLocationIds([]);
  //   setShowForm(true);
  // };

  // REPLACE your current handleOpenForm and handleEditClick with this:
  const handleOpenForm = (customer = null) => {
    // 1. SECURITY GUARD: For NEW registrations
    if (!customer && perms.can_create_customer === 0) {
      alert(
        "Action Denied: You do not have permission to register new customers.",
      );
      return;
    }

    // 2. LOGIC: For EXISTING customer (Edit or View mode)
    if (customer) {
      setEditingCustomer(customer);
      // If edit perm is 0, we lock the form (Read-Only)
      setIsFormReadOnly(perms.can_edit_customer === 0);

      setForm({
        ...customer,
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
    }

    // 3. LOGIC: For NEW customer
    else {
      setEditingCustomer(null);
      setIsFormReadOnly(false); // Always editable for new entries
      setForm(emptyFormState);
    }

    setDeletedLocationIds([]);
    setShowForm(true);
  };

  // const handleLocationChange = (index, field, value) => {
  //   if (isFormReadOnly) return;
  //   const newLocs = [...form.locations];
  //   if (field === "province") {
  //     const selected = provinces.find((p) => p.stateProvinceDesc === value);
  //     newLocs[index].province_id = selected?.stateProvinceCode || "";
  //     newLocs[index].province_name = value;
  //   } else {
  //     newLocs[index][field] = value;
  //   }
  //   setForm({ ...form, locations: newLocs });
  // };

  const handleLocationChange = (field, value) => {
    if (isFormReadOnly) return;

    // Shallow copy the array and the specific location object at index 0
    const newLocs = [...form.locations];
    newLocs[0] = { ...newLocs[0] };

    if (field === "province") {
      const selected = provinces.find((p) => p.stateProvinceDesc === value);
      newLocs[0].province_id = selected?.stateProvinceCode || "";
      newLocs[0].province_name = value;
    } else {
      newLocs[0][field] = value;
    }

    setForm({ ...form, locations: newLocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormReadOnly) return;

    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));
    const finalLocations = form.locations.filter(
      (loc) => loc.business_name.trim() !== "" && loc.address.trim() !== "",
    );
    console.log("Form Data:", form);
    console.log("Submitting with locations:", finalLocations);

    setLoading(true);
    try {
      const res = await fetch("/api/customer", {
        method: editingCustomer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          id: editingCustomer?.id,
          ...form,
          locations: finalLocations,
          deletedLocationIds,
        }),
      });
      if (res.ok) {
        // --- CONSULTANT MODE REDIRECT ---
        if (sessionStorage.getItem("activeConsultantMode") === "true") {
          sessionStorage.setItem(
            "userId",
            sessionStorage.getItem("consultantId"),
          );
          if (sessionStorage.getItem("parentConsultantId")) {
            sessionStorage.setItem(
              "parent_id",
              sessionStorage.getItem("parentConsultantId"),
            );
          }
          router.push("/consultant/customers");
        } else {
          // Normal User Flow
          setShowForm(false);
          loadCustomers();
          setForm(emptyFormState);
        }
      }
    } catch (err) {
      alert("Error saving.");
    } finally {
      setLoading(false);
    }
  };

  // UI GUARD: If cannot view, show nothing
  // if (!loadingUser && perms.can_view_customer === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
  //       <ShieldAlert size={48} />
  //       <p className="mt-4 font-bold">ACCESS RESTRICTED</p>
  //     </div>
  //   );
  // }

  if (loadingUser) return <Spinner />;

  return (
    <div
      className={`min-h-screen pt-4 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-[24px] md:text-3xl font-black font-bold tracking-tight text-slate-800">
              Customers
            </h1>
            <p className="text-slate-500 font-medium">
              Directory of registered entities
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm">
              <DownloadCloud size={18} /> Export
            </button>
            {perms.can_create_customer === 1 && (
              <button
                onClick={() => handleOpenForm()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <Plus size={18} /> Add Customer
              </button>
            )}
          </div>
        </div>

        <section className="bg-white rounded-lg shadow-md p-6 shadow-sm overflow-hidden">
          <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Users size={18} /> Client Directory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Customer Name</th>
                  <th className="px-4 py-4">Primary Business</th>
                  <th className="px-4 py-4">NTN</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
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
                    <td className="px-4 py-5 font-medium text-slate-600">
                      {cust.locations?.[0]?.business_name || "-"}
                    </td>
                    <td className="px-4 py-5 font-mono text-xs text-slate-500">
                      {cust.ntn}
                    </td>
                    <td className="px-4 py-5 text-xs">
                      <span
                        className={`px-3 py-1 rounded-full font-bold ${cust.allowed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {cust.allowed ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <button
                        onClick={() => handleOpenForm(cust)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        {perms.can_edit_customer === 1 ? (
                          <Edit3 size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 backdrop-blur-md bg-slate-900/40 z-50 flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-full overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b">
              <h2 className="text-2xl font-black font-semibold text-slate-800">
                {isFormReadOnly
                  ? "View Customer Details"
                  : editingCustomer
                    ? "Edit Customer"
                    : "Register New Customer"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* --- CONTACT SECTION --- */}
              <section>
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User size={16} /> Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black mb-2 font-semibold uppercase">
                      Customer Name
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                        ? "bg-gray-100 text-gray-500"
                        : "bg-slate-50"
                        }`}
                      value={form.customer_name}
                      onChange={(e) =>
                        setForm({ ...form, customer_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black mb-2 font-semibold uppercase">
                      Contact
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                        ? "bg-gray-100 text-gray-500"
                        : "bg-slate-50"
                        }`}
                      value={form.contact}
                      onChange={(e) =>
                        setForm({ ...form, contact: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black mb-2 font-semibold uppercase">
                      Email
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      type="email"
                      className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                        ? "bg-gray-100 text-gray-500"
                        : "bg-slate-50"
                        }`}
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </section>

              {/* --- TAX SECTION --- */}
              <section>
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={16} /> Tax Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black mb-2 font-semibold uppercase">
                      NTN *
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                        ? "bg-gray-100 text-gray-500"
                        : "bg-slate-50"
                        }`}
                      value={form.ntn}
                      onChange={(e) =>
                        setForm({ ...form, ntn: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black mb-2 font-semibold uppercase">
                      CNIC
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                        ? "bg-gray-100 text-gray-500"
                        : "bg-slate-50"
                        }`}
                      value={form.cnic}
                      onChange={(e) =>
                        setForm({ ...form, cnic: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black mb-2 font-semibold uppercase">
                      STRN
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                        ? "bg-gray-100 text-gray-500"
                        : "bg-slate-50"
                        }`}
                      value={form.strn}
                      onChange={(e) =>
                        setForm({ ...form, strn: e.target.value })
                      }
                    />
                  </div>
                </div>
              </section>

              {/* --- BRANCHES SECTION --- */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} /> Branches
                  </h3>
                  {/* {!isFormReadOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          locations: [
                            ...form.locations,
                            {
                              business_name: "",
                              province_id: "",
                              province_name: "",
                              address: "",
                            },
                          ],
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add
                    </button>
                  )} */}
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg shadow-md p-5 border border-slate-100 relative group">
                    {/* {!isFormReadOnly && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              locations: form.locations.filter(
                                (_, i) => i !== idx,
                              ),
                            })
                          }
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )} */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        readOnly={isFormReadOnly}
                        placeholder="Branch Name *"
                        className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                          ? "bg-gray-100 text-gray-500"
                          : "bg-slate-50"
                          }`}
                        value={form.locations[0].business_name}
                        onChange={(e) =>
                          handleLocationChange("business_name", e.target.value)
                        }
                        required
                      />
                      <div className="relative">
                        <select
                          disabled={isFormReadOnly}
                          className={`w-full px-4 py-3 rounded-lg appearance-none outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                            ? "bg-gray-100 text-gray-500"
                            : "bg-slate-50"
                            }`}
                          value={form.locations[0].province_name}
                          onChange={(e) =>
                            handleLocationChange("province", e.target.value)
                          }
                          required
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>
                    <input
                      readOnly={isFormReadOnly}
                      placeholder="Address *"
                      className={`w-full px-4 py-3 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all ${isFormReadOnly
                        ? "bg-gray-100 text-gray-500"
                        : "bg-slate-50"
                        }`}
                      value={form.locations[0].address}
                      onChange={(e) =>
                        handleLocationChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              {/* --- FOOTER --- */}
              <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    // If in consultant mode, close should return to the ledger
                    if (
                      sessionStorage.getItem("activeConsultantMode") === "true"
                    ) {
                      sessionStorage.setItem(
                        "userId",
                        sessionStorage.getItem("consultantId"),
                      );
                      if (sessionStorage.getItem("parentConsultantId")) {
                        sessionStorage.setItem(
                          "parent_id",
                          sessionStorage.getItem("parentConsultantId"),
                        );
                      }
                      router.push("/consultant/customers");
                    } else {
                      setShowForm(false);
                    }
                  }}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 px-6 py-3 rounded-lg font-bold"
                >
                  Close
                </button>
                {!isFormReadOnly && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold font-black flex items-center justify-center gap-2"
                  >
                    {/* <Check size={18} />{" "} */}
                    {loading ? "Saving..." : "Save Customer"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
