"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Plus,
  User,
  Link as LinkIcon,
  Settings,
  X,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  Building2,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SuperAdminMaster() {
  const [activeTab, setActiveTab] = useState("consultants");
  const [consultants, setConsultants] = useState([]);
  const [companyTypes, setCompanyTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [visibleSubUsersPasswords, setVisibleSubUsersPasswords] = useState({});

  // --- COLLAPSE STATE ---
  const [expandedParents, setExpandedParents] = useState(new Set());

  // --- SEPARATE FORM STATES ---
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [consultantForm, setConsultantForm] = useState({
    id: null,
    name: "",
    domain_name: "",
    password: "",
    parent_id: null,
    business_name: "",
    cnic_ntn: "",
    contact: "",
    email: "",
    address: "",
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    user_id: null,
    business_logo: "",
    seller_name: "",
    root_domain: "",
    root_username: "admin",
    password: "",
    designation: "",
    cnic_ntn: "",
    invoice_ntn: "",
    strn: "",
    email: "",
    contact: "",
    provinceId: null,
    province: "",
    address: "",
    token: "",
    ref_code: "",
    isAllowed: 1,
    isProd: 0,
    isPaid: 0,
    alert: null,
    leverage: null,
    expire: null,
    cycle: "",
    amount: 0,
    reason: "",
    company_type: "",
    user_type: "",
    deleted_businesses: [],
    businesses: [
      {
        business_id: null,
        business_logo: "",
        business_name: "",
        province: "",
        provinceId: null,
        address: "",
      },
    ],
    deleted_children: [],
    children: [],
  });

  const provinces = [
    { stateProvinceCode: 2, stateProvinceDesc: "BALOCHISTAN" },
    { stateProvinceCode: 4, stateProvinceDesc: "AZAD JAMMU AND KASHMIR" },
    { stateProvinceCode: 5, stateProvinceDesc: "CAPITAL TERRITORY" },
    { stateProvinceCode: 6, stateProvinceDesc: "KHYBER PAKHTUNKHWA" },
    { stateProvinceCode: 7, stateProvinceDesc: "PUNJAB" },
    { stateProvinceCode: 8, stateProvinceDesc: "SINDH" },
    { stateProvinceCode: 9, stateProvinceDesc: "GILGIT BALTISTAN" },
  ];
  const loadData = async () => {
    const route =
      activeTab === "consultants"
        ? "/api/admin/consultant"
        : "/api/admin/users";
    const res = await fetch(route);
    const data = await res.json();
    console.log("data", data);
    activeTab === "consultants" ? setConsultants(data) : setUsers(data);
  };

  const fetchCompanyType = async () => {
    const res = await fetch("/api/company-type");
    const data = await res.json();
    setCompanyTypes(data);
  };
  useEffect(() => {
    loadData();
    fetchCompanyType();
  }, [activeTab]);

  const extractDomain = (value) => {
    if (!value) return "";
    return value.includes("@") ? value.split("@")[1] : value;
  };

  const toggleParent = (parentId) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  const openConsultantModal = (parentId = null) => {
    setIsEditMode(false);
    setConsultantForm({
      id: null,
      name: "",
      domain_name: "",
      password: "",
      parent_id: parentId,
      business_name: "",
      cnic_ntn: "",
      contact: "",
      email: "",
      address: "",
    });
    setShowConsultantModal(true);
  };

  const handleEditConsultant = (item) => {
    setIsEditMode(true);
    setConsultantForm({
      id: item.id,
      name: item.name || "",
      domain_name: item.domain_name
        ? item.domain_name.replace("admin@", "")
        : "",
      password: "",
      parent_id: item.parent_id,
      business_name: item.business_name || "",
      cnic_ntn: item.cnic_ntn || "",
      contact: item.contact || "",
      email: item.email || "",
      address: item.address || "",
    });
    setShowConsultantModal(true);
  };

  const submitConsultant = async (e) => {
    e.preventDefault();
    console.log(consultantForm);
    const method = isEditMode ? "PUT" : "POST";
    const res = await fetch("/api/admin/consultant", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consultantForm),
    });
    if (res.ok) {
      setShowConsultantModal(false);
      loadData();
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
    setUserForm({
      user_id: user?.id,
      seller_name: user?.seller_name || "",
      business_logo: user?.business_logo || "",
      business_name: user?.business_name || "",
      root_domain: user?.root_domain || "",
      root_username: user?.root_username || "admin",
      password: user?.password || "",
      cnic_ntn: user?.cnic_ntn || "",
      invoice_ntn: user?.invoice_ntn || "",
      strn: user?.strn || "",
      email: user?.email || "",
      contact: user?.contact || "",
      designation: user?.designation || "",
      provinceId: user?.provinceId || null,
      province: user?.province || "",
      address: user?.address || "",
      token: user?.token || "",
      ref_code: user?.ref_code || "",
      isAllowed: user?.isAllowed ? 1 : 0,
      isProd: user?.isProd ? 1 : 0,
      isPaid: user?.isPaid ? 1 : 0,
      alert: user?.alert || 0,
      leverage: user?.leverage || 0,
      expire: user?.expire || "",
      cycle: user?.cycle || "",
      amount: user?.amount || 0,
      reason: user?.reason || "",
      company_type: user?.company_type || "",
      user_type: user?.user_type || "",
      businesses: user?.businesses || [],
      children: user?.children || [],
    });
    setShowUserModal(true);
  };

  const submitUser = async (e) => {
    e.preventDefault();
    console.log("Submitting User Form:", JSON.stringify(userForm));
    if (userForm.businesses.length < 1) {
      alert("please fill Business Info");
      return;
    }
    const method = isEditMode ? "PUT" : "POST";
    const res = await fetch("/api/admin/users", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    if (res.ok) {
      setShowUserModal(false);
      loadData();
    }
  };

  const togglePasswordVisibility = (idx) => {
    setVisibleSubUsersPasswords((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const dd = String(tomorrow.getDate()).padStart(2, "0");
  const minDateString = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex bg-slate-200 p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab("consultants")}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === "consultants" ? "bg-white text-blue-600 shadow-md" : "text-slate-500"}`}
            >
              Consultants
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === "users" ? "bg-white text-emerald-600 shadow-md" : "text-slate-500"}`}
            >
              Business Users
            </button>
          </div>
        </div>

        {activeTab === "consultants" ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => openConsultantModal()}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                <Plus size={20} /> New Parent Consultant
              </button>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b text-slate-400 text-xs font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-6">Consultant Name</th>
                    <th className="p-6">Domain Identity</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {consultants
                    .filter((c) => c.parent_id === null)
                    .map((parent) => (
                      <React.Fragment key={parent.id}>
                        <tr
                          className="hover:bg-blue-50/30 border-l-4 border-blue-500 cursor-pointer transition-colors"
                          onClick={() => toggleParent(parent.id)}
                        >
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              {expandedParents.has(parent.id) ? (
                                <ChevronDown
                                  size={20}
                                  className="text-blue-500"
                                />
                              ) : (
                                <ChevronRight
                                  size={20}
                                  className="text-slate-400"
                                />
                              )}
                              <span className="font-bold text-slate-800 text-lg">
                                {parent.business_name || parent.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="text-blue-600 font-mono font-bold italic text-sm">
                              {parent.domain_name}
                            </span>
                          </td>
                          <td
                            className="p-6 text-right flex justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openConsultantModal(parent.id)}
                              className="bg-emerald-500 text-white p-2.5 rounded-xl hover:scale-110 shadow-md transition-transform"
                            >
                              <Plus size={18} />
                            </button>
                            <button
                              onClick={() => handleEditConsultant(parent)}
                              className="bg-slate-800 text-white p-2.5 rounded-xl hover:bg-black transition-colors"
                            >
                              <Edit3 size={18} />
                            </button>
                          </td>
                        </tr>

                        {expandedParents.has(parent.id) &&
                          consultants
                            .filter((child) => child.parent_id === parent.id)
                            .map((child) => (
                              <tr
                                key={child.id}
                                className="bg-slate-50/50 border-l-4 border-emerald-400 animate-in fade-in slide-in-from-top-1 duration-200"
                              >
                                <td className="p-4 pl-16">
                                  <div className="flex items-center gap-2 text-slate-600 font-bold italic">
                                    {child.name}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="text-emerald-600 font-mono text-sm">
                                    {child.name
                                      .toLowerCase()
                                      .replace(/\s/g, "")}
                                    @
                                    {parent.domain_name.includes("@")
                                      ? parent.domain_name.split("@")[1]
                                      : parent.domain_name}
                                  </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditConsultant(child)}
                                    className="bg-white border border-slate-200 text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => openUserModal()}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
              >
                <UserPlus size={20} /> Create New Business
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => openUserModal(u)}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      {u.business_logo ? (
                        <img
                          src={u.business_logo}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <Building2 size={28} />
                      )}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    >
                      {u.isPaid ? "Paid" : "Unpaid"}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 truncate">
                    {u.businesses[0]?.business_name}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    CNIC/NTN: {u.cnic_ntn || "N/A"}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Mail size={14} className="text-blue-500" /> {u.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Phone size={14} className="text-slate-400" />{" "}
                      {u.contact || "No Contact"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                      <LinkIcon size={14} className="text-blue-600" />
                      Ref:{" "}
                      <span className="text-blue-600">{u.ref_code || ""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showConsultantModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={submitConsultant}
            className="bg-white rounded-[2.5rem] w-full max-w-4xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {isEditMode
                  ? "Edit Consultant"
                  : consultantForm.parent_id
                    ? "Add Child"
                    : "New Parent"}
              </h2>
              <X
                className="cursor-pointer text-slate-400 hover:text-slate-600"
                onClick={() => setShowConsultantModal(false)}
              />
            </div>

            {/* Using a grid: 2 columns for Parent, 1 column for Child (since it has fewer fields) */}
            <div
              className={`grid gap-4 ${!consultantForm.parent_id ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {/* ONLY SHOW THESE IF NOT A CHILD */}
              {consultantForm.parent_id === null && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Business Name
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                      value={consultantForm.business_name || ""}
                      onChange={(e) =>
                        setConsultantForm({
                          ...consultantForm,
                          business_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      CNIC / NTN
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                      value={consultantForm.cnic_ntn || ""}
                      onChange={(e) =>
                        setConsultantForm({
                          ...consultantForm,
                          cnic_ntn: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Contact
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                      value={consultantForm.contact || ""}
                      onChange={(e) =>
                        setConsultantForm({
                          ...consultantForm,
                          contact: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Email
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                      value={consultantForm.email || ""}
                      onChange={(e) =>
                        setConsultantForm({
                          ...consultantForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Address
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                      value={consultantForm.address || ""}
                      onChange={(e) =>
                        setConsultantForm({
                          ...consultantForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {/* ALWAYS SHOW THESE (Name, Domain, Password) */}
              <div className={!consultantForm.parent_id ? "col-span-1" : ""}>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Name
                </label>
                <input
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                  placeholder="e.g. Abdullah"
                  value={consultantForm.name || ""}
                  onChange={(e) => {
                    const newName = e.target.value;
                    let newDomain = consultantForm.domain_name;
                    if (consultantForm.parent_id) {
                      const parent = consultants.find(
                        (c) => c.id === consultantForm.parent_id,
                      );
                      const parentDomain = parent?.domain_name || "domain.com";
                      const cleanName = newName
                        .toLowerCase()
                        .replace(/\s/g, "");
                      newDomain = `${cleanName}@${parentDomain.includes("@") ? parentDomain.split("@")[1] : parentDomain}`;
                    }

                    setConsultantForm({
                      ...consultantForm,
                      name: newName,
                      domain_name: newDomain,
                    });
                  }}
                  required
                />
              </div>

              <div>
                {!consultantForm.parent_id ? (
                  <>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Domain (e.g. honda.com)
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                      value={consultantForm.domain_name || ""}
                      onChange={(e) =>
                        setConsultantForm({
                          ...consultantForm,
                          domain_name: e.target.value,
                        })
                      }
                      required
                    />
                  </>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-700 uppercase">
                      Auto-Assigned Domain
                    </p>
                    <p className="text-sm font-mono text-emerald-900 mt-1">
                      {consultantForm.name?.toLowerCase().replace(/\s/g, "") ||
                        "[name]"}
                      @
                      {(() => {
                        const parent = consultants.find(
                          (c) => c.id === consultantForm.parent_id,
                        );
                        return parent?.domain_name || "domain.com";
                      })()}
                    </p>
                  </div>
                )}
              </div>

              <div className={!consultantForm.parent_id ? "col-span-2" : ""}>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Password
                </label>
                <input
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                  type="password"
                  onChange={(e) =>
                    setConsultantForm({
                      ...consultantForm,
                      password: e.target.value,
                    })
                  }
                  required={!isEditMode}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
            >
              {isEditMode ? "Update Record" : "Save Consultant"}
            </button>
          </form>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={submitUser}
            className="bg-white rounded-[2.5rem] w-full max-w-7.5xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 z-10 border-b">
              <h2 className="text-2xl font-black flex items-center gap-3 text-emerald-600">
                <UserPlus /> Create User Profile
              </h2>
              <X
                className="cursor-pointer text-slate-400 hover:text-red-500"
                onClick={() => setShowUserModal(false)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Section 1: Identity */}
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-1">
                  Core Identity
                </h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Seller Name
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none"
                    value={userForm.seller_name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, seller_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Root Domain *
                  </label>

                  <div className="flex items-center bg-slate-50 rounded-xl border-2 border-transparent focus-within:border-emerald-500">
                    <span className="px-3 text-slate-400 font-bold text-sm">
                      admin@
                    </span>

                    <input
                      className="flex-1 p-3 bg-transparent outline-none"
                      placeholder="hondaltd.com"
                      value={userForm.root_domain}
                      onChange={(e) => {
                        const clean = extractDomain(e.target.value);
                        setUserForm({
                          ...userForm,
                          root_domain: clean,
                        });
                      }}
                      required
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 ml-2">
                    Final Domain: admin@{userForm.root_domain || "domain.com"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Access Password *
                  </label>
                  <div className="relative">
                    <input
                      className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none transition-all pr-12"
                      type={showPassword ? "text" : "password"}
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      required={!isEditMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Designation
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none"
                    value={userForm.designation}
                    onChange={(e) =>
                      setUserForm({ ...userForm, designation: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Section 2: Registration & Tax */}
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-1">
                  Tax & Verification
                </h4>

                {/* CNIC / NTN Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    CNIC / Reg No *
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none"
                    placeholder="7-digit NTN or 13-digit CNIC"
                    value={userForm.cnic_ntn}
                    maxLength={13}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value.length > 13) value = value.slice(0, 13);
                      setUserForm({ ...userForm, cnic_ntn: value });
                    }}
                    onBlur={(e) => {
                      if (e.target.value && !e.target.checkValidity()) {
                        e.target.reportValidity();
                      }
                    }}
                    pattern="^([a-zA-Z0-9]{7}|\d{13})$"
                    onInvalid={(e) =>
                      e.target.setCustomValidity(
                        "Enter a 7-digit Alphanumeric REG No or a 13-digit Numeric CNIC",
                      )
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                  />
                </div>

                {/* Invoice NTN Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Invoice NTN *
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500  outline-none"
                    placeholder="7-digit NTN or 13-digit CNIC"
                    value={userForm.invoice_ntn}
                    maxLength={13}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value.length > 13) value = value.slice(0, 13);
                      setUserForm({ ...userForm, invoice_ntn: value });
                    }}
                    onBlur={(e) => {
                      if (e.target.value && !e.target.checkValidity()) {
                        e.target.reportValidity();
                      }
                    }}
                    pattern="^([a-zA-Z0-9]{7}|\d{13})$"
                    onInvalid={(e) =>
                      e.target.setCustomValidity(
                        "Enter a 7-digit Alphanumeric NTN or a 13-digit Numeric CNIC",
                      )
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    STRN
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500  outline-none"
                    value={userForm.strn}
                    onChange={(e) => {
                      let value = e.target.value;
                      setUserForm({ ...userForm, strn: value });
                    }}
                  />
                </div>

                {/* System Token */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    System Token *
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none"
                    value={userForm.token}
                    onChange={(e) =>
                      setUserForm({ ...userForm, token: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              {/* Section 3: Contact */}
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-1">
                  Contact Details
                </h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Email Address
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Contact Number
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none"
                    value={userForm.contact}
                    onChange={(e) =>
                      setUserForm({ ...userForm, contact: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 pt-2 border-t">
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase text-slate-500">
                  Business Information
                </h4>
              </div>
              <div className="space-y-1 mb-1 md:col-span-4">
                {userForm.businesses?.map((business, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100"
                  >
                    <div className="flex-[1.5] flex flex-col w-full">
                      <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                        Business Name *
                      </label>
                      <input
                        className="flex-1 p-2.5 bg-white rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none text-xs"
                        placeholder="Business Name"
                        value={business.business_name}
                        onChange={(e) => {
                          const updated = [...userForm.businesses];
                          updated[idx].business_name = e.target.value;
                          setUserForm({ ...userForm, businesses: updated });
                        }}
                        required
                      />
                    </div>
                    <div className="flex-[1.5] flex flex-col w-full">
                      <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1 tracking-widest">
                        Province *
                      </label>
                      <div className="relative">
                        <select
                          className="w-full p-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 transition-all duration-300 outline-none text-[10px] text-slate-700 appearance-none cursor-pointer"
                          value={business.province}
                          required
                          onChange={(e) => {
                            const selectedDesc = e.target.value;
                            const selectedProv = provinces.find(
                              (p) => p.stateProvinceDesc === selectedDesc,
                            );
                            console.log(
                              "Selected Province:",
                              selectedDesc,
                              selectedProv,
                            );
                            const updated = [...userForm.businesses];
                            updated[idx].province = selectedDesc;
                            updated[idx].provinceId = selectedProv
                              ? selectedProv.stateProvinceCode
                              : "";
                            setUserForm({ ...userForm, businesses: updated });
                          }}
                        >
                          <option value="">Select Province</option>
                          {provinces.map((prov) => (
                            <option
                              key={prov.stateProvinceCode}
                              value={prov.stateProvinceDesc}
                            >
                              {prov.stateProvinceDesc}
                            </option>
                          ))}
                        </select>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex-[1.5] flex flex-col w-full">
                      <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                        Address *
                      </label>
                      <input
                        className="flex-1 p-2.5 bg-white rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none text-xs"
                        placeholder="Address"
                        value={business.address}
                        onChange={(e) => {
                          const updated = [...userForm.businesses];
                          updated[idx].address = e.target.value;
                          setUserForm({ ...userForm, businesses: updated });
                        }}
                        required
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserForm((prev) => {
                          // 1. Get the business object we are about to delete using the index
                          const businessToDelete = prev.businesses[idx];

                          // 2. Filter out the business from the UI list
                          const updatedBusinesses = prev.businesses.filter(
                            (_, i) => i !== idx,
                          );

                          // 3. Prepare the deleted IDs array
                          let updatedDeleted = prev.deleted_businesses || [];

                          // 4. Check for 'id' OR 'business_id' (to cover both DB and local state naming)
                          const idToTrack =
                            businessToDelete?.id ||
                            businessToDelete?.business_id;
                          console.log(
                            "Business to delete:",
                            businessToDelete,
                            "Tracking ID:",
                            idToTrack,
                          );
                          if (idToTrack) {
                            // Use a Set-like check to avoid duplicate IDs if the user clicks twice
                            if (!updatedDeleted.includes(idToTrack)) {
                              updatedDeleted = [...updatedDeleted, idToTrack];
                            }
                          }

                          return {
                            ...prev,
                            businesses: updatedBusinesses,
                            deleted_businesses: updatedDeleted,
                          };
                        });
                      }}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Business Row */}
              <div className="flex items-center gap-3 md:col-span-4 bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                <div className="flex-[1.5] flex flex-col w-full">
                  <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                    Business Name *
                  </label>
                  <input
                    className="flex-1 p-2.5 bg-white rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none text-xs"
                    placeholder="Business Name"
                    value={userForm.newBusinessName || ""}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        newBusinessName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex-[1.5] flex flex-col w-full">
                  <label className="text-[10px] uppercase ml-1 text-slate-500 mb-1 tracking-widest">
                    Province *
                  </label>
                  <div className="relative">
                    <select
                      className="w-full p-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 transition-all duration-300 text-[10px] outline-none text-slate-700 appearance-none cursor-pointer"
                      value={userForm.newBusinessProvince || ""}
                      onChange={(e) => {
                        const selectedProv = provinces.find(
                          (p) => p.stateProvinceDesc === e.target.value,
                        );
                        setUserForm({
                          ...userForm,
                          newBusinessProvince: e.target.value,
                          newBusinessProvinceId: selectedProv
                            ? selectedProv.stateProvinceCode
                            : null,
                        });
                      }}
                    >
                      <option value="">Select Province</option>
                      {provinces.map((prov) => (
                        <option
                          key={prov.stateProvinceCode}
                          value={prov.stateProvinceDesc}
                        >
                          {prov.stateProvinceDesc}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div className="flex-[1.5] flex flex-col w-full">
                  <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                    Address *
                  </label>
                  <input
                    className="flex-1 p-2.5 bg-white rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none text-xs"
                    placeholder="Address"
                    value={userForm.newBusinessAddress || ""}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        newBusinessAddress: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  className="bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all py-2.5 px-4"
                  onClick={() => {
                    const name = userForm.newBusinessName?.trim();
                    const province = userForm.newBusinessProvince?.trim();
                    const province_id = userForm.newBusinessProvinceId; // This was missing in your log
                    const address = userForm.newBusinessAddress?.trim();

                    if (!name) return;

                    setUserForm({
                      ...userForm,
                      businesses: [
                        ...(userForm.businesses || []),
                        {
                          business_id: null, // Explicitly null for new records
                          business_name: name,
                          province: province || "",
                          province_id: province_id || null, // ADDED THIS
                          address: address || "",
                        },
                      ],
                      // Reset temporary fields
                      newBusinessName: "",
                      newBusinessProvince: "",
                      newBusinessProvinceId: null,
                      newBusinessAddress: "",
                    });
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 pt-4 border-t">
              {/* Billing & Logic */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest ">
                  Billing & Subscription
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                      Amount Paid
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-[10px] font-black text-slate-400">
                        PKR
                      </span>
                      <input
                        className="w-full p-3 pl-12 bg-slate-50 rounded-xl outline-none border-2 border-transparent focus:border-emerald-500  transition-all"
                        type="text"
                        inputMode="numeric" // Changes mobile keyboard to numbers only
                        placeholder="0"
                        value={userForm.amount ?? ""}
                        onChange={(e) => {
                          let val = e.target.value;

                          // 1. Clean input: Remove everything except numbers (No dots allowed)
                          const cleaned = val.replace(/\D/g, "");

                          setUserForm({ ...userForm, amount: cleaned });
                        }}
                        onBlur={() => {
                          let current = (userForm.amount ?? "")
                            .toString()
                            .trim();

                          // 2. If empty or invalid, default to "0"
                          if (current === "" || isNaN(Number(current))) {
                            setUserForm({ ...userForm, amount: "0" });
                            return;
                          }

                          // 3. Ensure it's a clean integer string
                          setUserForm({
                            ...userForm,
                            amount: parseInt(current, 10).toString(),
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-3 text-slate-400"
                        size={16}
                      />
                      <input
                        className="w-full p-3 pl-10 bg-slate-50 rounded-xl outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
                        type="date"
                        min={minDateString}
                        value={userForm.expire}
                        onChange={(e) =>
                          setUserForm({ ...userForm, expire: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                      Billing Cycle
                    </label>
                    <input
                      className="w-full p-3 bg-slate-50 rounded-xl outline-none"
                      placeholder="e.g: Monthly / Yearly"
                      value={userForm.cycle}
                      onChange={(e) =>
                        setUserForm({ ...userForm, cycle: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                      Reason
                    </label>
                    <input
                      className="w-full p-3 bg-slate-50 rounded-xl outline-none"
                      placeholder="e.g: on hold"
                      value={userForm.reason}
                      onChange={(e) =>
                        setUserForm({ ...userForm, reason: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Switches & Logic */}
              <div className="md:col-span-1 space-y-4 bg-slate-50 p-4 rounded-3xl">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest text-center border-b pb-1">
                  Status Flags
                </h4>
                <div className="flex items-center justify-between p-2">
                  <label className="text-[10px] font-black uppercase">
                    Paid
                  </label>
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-emerald-500"
                    checked={userForm.isPaid === 1}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        isPaid: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-2">
                  <label className="text-[10px] font-black uppercase">
                    Allowed
                  </label>
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-blue-500"
                    checked={userForm.isAllowed === 1}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        isAllowed: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-2">
                  <label className="text-[10px] font-black uppercase">
                    Production
                  </label>
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-red-500"
                    checked={userForm.isProd === 1}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        isProd: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Reference & Assignment */}
            </div>
            <div className="md:col-span-3 mt-6">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-1 mb-4">
                Assignment & Parameters
              </h4>

              {/* Main Row Container */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
                {/* 1. Account Management Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500 italic">
                    User Management Type *
                  </label>
                  <select
                    className="w-full p-3 bg-blue-50 text-blue-800 rounded-xl border-2 border-blue-100 font-bold outline-none focus:border-blue-400 text-xs"
                    value={userForm.user_type}
                    required
                    onChange={(e) =>
                      setUserForm({ ...userForm, user_type: e.target.value })
                    }
                  >
                    <option value="">Select User Type</option>
                    <option value="managed_by_consultant">
                      Managed By Consultant
                    </option>
                    <option value="self_managed">Self Managed</option>
                  </select>
                </div>
                {/* 2. Assign Consultant */}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500 italic">
                    Assign Consultant
                  </label>
                  <select
                    className="w-full p-3 bg-blue-50 text-blue-800 rounded-xl border-2 border-blue-100 font-bold outline-none text-xs"
                    value={userForm.ref_code}
                    required={userForm.user_type === "managed_by_consultant"}
                    onChange={(e) =>
                      setUserForm({ ...userForm, ref_code: e.target.value })
                    }
                  >
                    <option value="">Select Consultant</option>
                    {consultants
                      .filter((c) => c.parent_id == null)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.business_name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 3. Company Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500 italic">
                    Company Type
                  </label>
                  <select
                    className="w-full p-3 bg-blue-50 text-blue-800 rounded-xl border-2 border-blue-100 font-bold outline-none text-xs"
                    value={userForm.company_type}
                    required
                    onChange={(e) =>
                      setUserForm({ ...userForm, company_type: e.target.value })
                    }
                  >
                    <option value="">Select Company Type</option>
                    {companyTypes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Alert */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Alert
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-emerald-500 text-xs"
                    type="number"
                    value={userForm.alert}
                    onChange={(e) =>
                      setUserForm({ ...userForm, alert: e.target.value })
                    }
                  />
                </div>

                {/* 5. Leverage */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                    Leverage
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-emerald-500 text-xs"
                    type="number"
                    value={userForm.leverage}
                    onChange={(e) =>
                      setUserForm({ ...userForm, leverage: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* <div className="mt-8 space-y-1">
                            <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">Complete Address *</label>
                            <textarea className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 h-24"
                                required value={userForm.address} onChange={e => setUserForm({ ...userForm, address: e.target.value })} />
                        </div> */}
            {isEditMode && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-1 mb-4">
                  Sub-Account Management
                </h4>

                {/* List of Children (Editable) */}
                <div className="space-y-4 mb-6">
                  {userForm.children?.map((child, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-row items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all focus-within:border-blue-200 focus-within:bg-white"
                    >
                      {/* 1. Icon & Badge Section */}
                      <div className="flex items-center gap-2 shrink-0 pt-1">
                        <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center text-blue-600 border shadow-sm">
                          <User size={16} />
                        </div>
                        {!child.id && (
                          <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                            New
                          </span>
                        )}
                      </div>

                      {/* 2. Display Name */}
                      <div className="flex-[1.5] flex flex-col w-full">
                        <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                          Display Name *
                        </label>
                        <input
                          className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-blue-400 outline-none text-xs font-bold text-slate-700 transition-colors"
                          value={child.username}
                          placeholder="e.g. Abdullah"
                          onChange={(e) => {
                            const newChildren = [...userForm.children];
                            newChildren[idx].username = e.target.value;
                            setUserForm({ ...userForm, children: newChildren });
                          }}
                          required
                        />
                        {/* Empty space to match Domain Name height */}
                        <div className="h-4" />
                      </div>

                      {/* 3. Domain Name */}
                      <div className="flex-[2] flex flex-col w-full">
                        <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                          Domain Name *
                        </label>
                        <div className="flex items-center border-b border-slate-200 focus-within:border-blue-400 transition-colors">
                          <input
                            className="flex-1 p-2 bg-transparent outline-none text-xs text-slate-600"
                            placeholder="login id"
                            value={child.domain_name}
                            onChange={(e) => {
                              const clean = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]/g, "");
                              const newChildren = [...userForm.children];
                              newChildren[idx].domain_name = clean;
                              setUserForm({
                                ...userForm,
                                children: newChildren,
                              });
                            }}
                            required
                          />
                          <span className="text-xs text-slate-400 px-2 font-medium">
                            @{userForm.root_domain}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 ml-1 truncate">
                          Final: {child.login_slug || "id"}@
                          {userForm.root_domain}
                        </p>
                      </div>

                      {/* 4. Password */}
                      <div className="flex-[1.5] flex flex-col w-full relative">
                        <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            className="w-full p-2 pr-8 bg-transparent border-b border-slate-200 focus:border-blue-400 outline-none text-xs text-slate-600 transition-colors"
                            type={
                              visibleSubUsersPasswords[idx]
                                ? "text"
                                : "password"
                            }
                            placeholder={
                              child.id ? "••••••••" : "Enter Password"
                            }
                            value={child.password || ""}
                            onChange={(e) => {
                              const newChildren = [...userForm.children];
                              newChildren[idx].password = e.target.value;
                              setUserForm({
                                ...userForm,
                                children: newChildren,
                              });
                            }}
                            required={!child.id}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(idx)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                          >
                            {visibleSubUsersPasswords[idx] ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                          </button>
                        </div>
                        <div className="h-4" />
                      </div>

                      <div className="flex-[1.5] flex flex-col w-full">
                        <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                          Contact
                        </label>
                        <input
                          className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-blue-400 outline-none text-xs font-bold text-slate-700 transition-colors"
                          value={child.contact}
                          placeholder="e.g. 03XXXXX"
                          onChange={(e) => {
                            const newChildren = [...userForm.children];
                            newChildren[idx].contact = e.target.value;
                            setUserForm({ ...userForm, children: newChildren });
                          }}
                        />
                      </div>
                      <div className="flex-[1.5] flex flex-col w-full">
                        <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                          Email
                        </label>
                        <input
                          className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-blue-400 outline-none text-xs font-bold text-slate-700 transition-colors"
                          value={child.email}
                          placeholder="e.g. example@mai.com"
                          onChange={(e) => {
                            const newChildren = [...userForm.children];
                            newChildren[idx].email = e.target.value;
                            setUserForm({ ...userForm, children: newChildren });
                          }}
                          required
                        />
                      </div>
                      <div className="flex-[1.5] flex flex-col w-full">
                        <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                          Address
                        </label>
                        <input
                          className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-blue-400 outline-none text-xs font-bold text-slate-700 transition-colors"
                          value={child.address}
                          placeholder="e.g. Washington DC"
                          onChange={(e) => {
                            const newChildren = [...userForm.children];
                            newChildren[idx].adress = e.target.value;
                            setUserForm({ ...userForm, children: newChildren });
                          }}
                        />
                      </div>
                      <div className="flex-[1.5] flex flex-col w-full">
                        <label className="text-[10px] font-bold uppercase ml-1 text-slate-500 mb-1">
                          Designation
                        </label>
                        <input
                          className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-blue-400 outline-none text-xs font-bold text-slate-700 transition-colors"
                          value={child.designation}
                          placeholder="e.g. Assistant"
                          onChange={(e) => {
                            const newChildren = [...userForm.children];
                            newChildren[idx].designation = e.target.value;
                            setUserForm({ ...userForm, children: newChildren });
                          }}
                        />
                      </div>
                      {/* 5. Status & Actions */}

                      <div className="flex items-center gap-3 shrink-0 pt-5 self-start md:self-center">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-emerald-500 cursor-pointer"
                            checked={child.is_active == 1}
                            onChange={(e) => {
                              const newChildren = [...userForm.children];
                              newChildren[idx].is_active = e.target.checked
                                ? 1
                                : 0;
                              setUserForm({
                                ...userForm,
                                children: newChildren,
                              });
                            }}
                          />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Active
                          </span>
                        </div>

                        {!child.id && (
                          <button
                            type="button"
                            onClick={() => {
                              const newChildren = userForm.children.filter(
                                (_, i) => i !== idx,
                              );
                              setUserForm({
                                ...userForm,
                                children: newChildren,
                              });
                            }}
                            className="bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 p-2 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Add New Row (Logic stays the same) */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
                                    <input
                                        className="p-2.5 bg-white rounded-xl border-2 border-transparent focus:border-blue-400 outline-none text-xs"
                                        placeholder="New Child Username"
                                        id="new-child-name"
                                    />
                                    <input
                                        className="p-2.5 bg-white rounded-xl border-2 border-transparent focus:border-blue-400 outline-none text-xs"
                                        type="password"
                                        placeholder="New Child Password"
                                        id="new-child-pass"
                                    />
                                    <button
                                        type="button"
                                        className="bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all py-2.5"
                                        onClick={() => {
                                            const name = document.getElementById('new-child-name').value;
                                            const pass = document.getElementById('new-child-pass').value;
                                            if (!name || !pass) return;

                                            setUserForm({
                                                ...userForm,
                                                children: [...userForm.children, { username: name, password: pass, is_active: 1 }]
                                            });

                                            document.getElementById('new-child-name').value = '';
                                            document.getElementById('new-child-pass').value = '';
                                        }}
                                    >
                                        Add To List
                                    </button>
                                </div> */}
                <div className="space-y-3 mb-6">
                  {/* New Child Row */}
                  <div className="flex flex-col md:flex-row items-center gap-3 bg-blue-50/30 p-3 rounded-xl border border-blue-100 transition-all">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-blue-600 border shadow-sm">
                        <User size={14} />
                      </div>
                      <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                        New
                      </span>
                    </div>

                    {/* Display Name */}
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                        Display Name *
                      </label>
                      <input
                        className="flex-1 p-2 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-xs font-bold text-slate-700"
                        placeholder="New Child Display Name"
                        value={userForm.newChildName || ""}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            newChildName: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Domain Name */}
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                        Domain Name *
                      </label>
                      <div className="flex items-center mt-1 border-b">
                        <input
                          className="flex-1 p-2 bg-transparent outline-none text-xs text-slate-600"
                          placeholder="Login ID"
                          value={userForm.newChildLogin || ""}
                          onChange={(e) => {
                            const clean = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, "");
                            setUserForm({ ...userForm, newChildLogin: clean });
                          }}
                        />
                        <span className="text-xs text-slate-400 px-2">
                          @{userForm.root_domain || "domain.com"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 ml-2">
                        Final Domain: {userForm.newChildLogin || "username"}@
                        {userForm.root_domain || "domain.com"}
                      </p>
                    </div>

                    {/* Password */}
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                        Password *
                      </label>
                      <input
                        className="p-2 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-xs text-slate-500"
                        type="password"
                        placeholder="Password"
                        value={userForm.newChildPassword || ""}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            newChildPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                        Contact *
                      </label>
                      <input
                        className="flex-1 p-2 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-xs font-bold text-slate-700"
                        placeholder="New Child Contact"
                        value={userForm.newChildContact || ""}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            newChildContact: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                        Email *
                      </label>
                      <input
                        className="flex-1 p-2 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-xs font-bold text-slate-700"
                        placeholder="New Child Email"
                        value={userForm.newChildEmail || ""}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            newChildEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                        Address
                      </label>
                      <input
                        className="flex-1 p-2 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-xs font-bold text-slate-700"
                        placeholder="New Child Adress"
                        value={userForm.newChildAddress || ""}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            newChildAddress: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-bold uppercase ml-2 text-slate-500">
                        Designation
                      </label>
                      <input
                        className="flex-1 p-2 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-xs font-bold text-slate-700"
                        placeholder="New Child Email"
                        value={userForm.newChildDesignation || ""}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            newChildDesignation: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Add + Remove Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all py-2 px-3"
                        onClick={() => {
                          const name = userForm.newChildName?.trim();
                          const login = userForm.newChildLogin?.trim();
                          const password = userForm.newChildPassword?.trim();
                          const contact = userForm.newChildContact?.trim();
                          const email = userForm.newChildEmail?.trim();
                          const address = userForm.newChildAddress?.trim();
                          const designation =
                            userForm.newChildDesignation?.trim();
                          if (!name || !login || !password || !email) {
                            alert("Please fill child details");
                            return;
                          }

                          setUserForm({
                            ...userForm,
                            children: [
                              ...userForm.children,
                              {
                                username: name,
                                domain_name: login,
                                password: password,
                                contact,
                                email,
                                address,
                                designation,
                                is_active: 1,
                              },
                            ],
                            newChildName: "",
                            newChildLogin: "",
                            newChildPassword: "",
                            newChildContact: "",
                            newChildEmail: "",
                            newChildAddress: "",
                            newChildDesignation: "",
                          });
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-10">
              <button
                type="submit"
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.01] transition-all"
              >
                CONFIRM & SAVE BUSINESS USER
              </button>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-10 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold hover:bg-red-50 hover:text-red-500 transition-all"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
