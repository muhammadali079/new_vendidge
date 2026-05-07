"use client";

import React, { useEffect, useState, useCallback } from "react";
import PasswordInput from "@/components/input/PasswordInput";
import {
  Edit3,
  Check,
  Plus,
  User,
  Building2,
  Mail,
  Phone,
  Settings,
  X,
  MapPin,
  Trash2,
  Globe,
} from "lucide-react";

export default function ProfileScreen({ darkMode }) {
  // --- UI States ---
  const [provinces, setProvinces] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // --- Unified Form State ---
  const [form, setForm] = useState({
    id: null,
    email: "",
    contact: "",
    invoice_type: "sandbox",
    bearer_token: "",
    cnic_ntn: "",
    invoice_ntn: "",
    strn: "",
    seller_name: "",
    designation: "",
    businesses: [],
    deleted_businesses: [],
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // --- Data Fetching ---
  const loadProfileData = useCallback(async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    setLoadingProfile(true);
    try {
      // Fetch User + Business Info in one call
      const res = await fetch(`/api/user?userId=${userId}`);
      const data = await res.json();
      console.log("busines", JSON.stringify(data.businesses));

      if (data && !data.error) {
        setForm({
          id: data.id,
          seller_name: data.seller_name || "",
          email: data.email || "",
          contact: data.contact || "",
          cnic_ntn: data.cnic_ntn || "",
          invoice_ntn: data.invoice_ntn || "",
          strn: data.strn || "",
          designation: data.designation || "",
          invoice_type: Number(data.isProd) === 1 ? "production" : "sandbox",
          bearer_token: data.token || "",
          businesses: data.businesses || [],
          deleted_businesses: [],
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);
  const getFbrHeaders = () => {
    const token = sessionStorage.getItem("sellerToken");
    return token
      ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
      : { Accept: "application/json" };
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/fbr/provinces", {
          headers: getFbrHeaders(),
        });
        const json = await res.json();
        setProvinces(json?.data || []);
      } catch (err) {
        console.warn("Province fetch error", err);
      }
    };

    fetchProvinces();
    loadProfileData();
  }, [loadProfileData]);

  // --- Form Handlers ---
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessChange = (index, field, value) => {
    const updatedBusinesses = [...form.businesses];
    if (field === "province") {
      const selected = provinces.find((p) => p.stateProvinceDesc === value);
      updatedBusinesses[index].province = selected
        ? selected.stateProvinceDesc
        : "";
      updatedBusinesses[index].province_id = selected
        ? selected.stateProvinceCode
        : null;
    } else {
      updatedBusinesses[index][field] = value;
    }
    setForm((prev) => ({ ...prev, businesses: updatedBusinesses }));
  };

  const addNewBusiness = () => {
    setForm((prev) => ({
      ...prev,
      businesses: [
        ...prev.businesses,
        {
          business_name: "",
          province: "",
          province_id: null,
          address: "",
          isNew: true,
        },
      ],
    }));
  };

  const removeBusiness = (index) => {
    const businessToRemove = form.businesses[index];

    if (businessToRemove.id) {
      setForm((prev) => ({
        ...prev,
        // The (prev.deleted_businesses || []) prevents the "not iterable" error
        deleted_businesses: [
          ...(prev.deleted_businesses || []),
          businessToRemove.id,
        ],
        businesses: prev.businesses.filter((_, i) => i !== index),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        businesses: prev.businesses.filter((_, i) => i !== index),
      }));
    }
  };
  const handleSave = async () => {
    if (!form.bearer_token || form.bearer_token === "") {
      alert("FBR token is missing");
      return;
    }

    if (form.businesses.length === 0) {
      alert("You must have at least one business registered.");
      return;
    }

    // 2. Requirement: Each business must have Name, Province, and Address
    const isIncomplete = form.businesses.some(
      (b) =>
        !b.business_name?.trim() || !b.province?.trim() || !b.address?.trim(),
    );

    if (isIncomplete) {
      alert(
        "Please complete all business details: Name, Province, and Address are required for every entry.",
      );
      return;
    }
    console.log("form", JSON.stringify(form));

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          ...form,
        }),
      });

      if (res.ok) {
        sessionStorage.setItem("sellerProvince", form.businesses[0].province);
        sessionStorage.setItem(
          "sellerProvinceId",
          form.businesses[0].province_id,
        );
        console.log(
          "Seller Province:",
          sessionStorage.getItem("sellerProvince"),
        );
        sessionStorage.setItem(
          "sellerBusinessName",
          form.businesses[0].business_name,
        );
        sessionStorage.setItem("sellerNTNCNIC", form.cnic_ntn);
        sessionStorage.setItem("sellerAddress", form.address);
        sessionStorage.setItem("sellerToken", form.bearer_token);
        const isProd = form.invoice_type === "production" ? "1" : "0";
        document.cookie = `isProd=${isProd}; path=/; SameSite=Lax`;
        setIsEditing(false);
        loadProfileData();
        //alert("Profile and Businesses saved successfully.");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      alert("Error saving profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Password Handlers ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveNewPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/userPassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });

      if (res.ok) {
        alert("Password updated successfully!");
        setShowPasswordForm(false);
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update password.");
      }
    } catch (error) {
      alert("Server error. Try again later.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Syncing Profile...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-8 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-5xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Account Settings
            </h1>
            <p className="text-slate-500 font-medium">
              Manage your identity and business units
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSavingProfile}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={20} />
                  )}
                  {isSavingProfile ? "Saving..." : "Save All Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfileData();
                  }}
                  className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* --- SECTION 1: ACCOUNT DETAILS --- */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={18} /> Primary User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  Full Name
                </label>
                <input
                  name="seller_name"
                  value={form.seller_name}
                  onChange={handleAccountChange}
                  disabled={!isEditing}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  CNIC / NTN
                </label>
                <input
                  value={form.cnic_ntn}
                  readOnly
                  className="w-full p-4 bg-slate-100 border-none rounded-2xl font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  Invoice NTN
                </label>
                <input
                  name="invoice_ntn"
                  value={form.invoice_ntn}
                  readOnly
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  STRN
                </label>
                <input
                  name="strn"
                  value={form.strn}
                  onChange={handleAccountChange}
                  disabled={!isEditing}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleAccountChange}
                  disabled={!isEditing}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  Contact Number
                </label>
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleAccountChange}
                  disabled={!isEditing}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  FBR Token
                </label>
                <input
                  name="bearer_token"
                  value={form.bearer_token}
                  onChange={handleAccountChange}
                  required
                  disabled={!isEditing}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  Designation
                </label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleAccountChange}
                  disabled={!isEditing}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          {/* --- SECTION 2: BUSINESS UNITS --- */}
          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={18} /> Registered Business Units
              </h2>
              {isEditing && (
                <button
                  onClick={addNewBusiness}
                  className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-100 flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Add Business Entity
                </button>
              )}
            </div>

            <div className="space-y-4">
              {form.businesses.map((biz, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-[2rem] p-8 relative overflow-hidden group transition-all hover:border-emerald-200 shadow-sm"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />

                  {isEditing && (
                    <button
                      onClick={() => removeBusiness(index)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                        Business Name
                      </label>
                      <input
                        value={biz.business_name}
                        onChange={(e) =>
                          handleBusinessChange(
                            index,
                            "business_name",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        placeholder="Trading Name"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                        Province
                      </label>
                      <select
                        value={biz.province}
                        onChange={(e) =>
                          handleBusinessChange(
                            index,
                            "province",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                        Physical Address
                      </label>
                      <textarea
                        value={biz.address}
                        onChange={(e) =>
                          handleBusinessChange(index, "address", e.target.value)
                        }
                        disabled={!isEditing}
                        rows="2"
                        placeholder="Unit, Floor, Street, City..."
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- SECTION 3: SECURITY --- */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
            >
              <Settings size={18} /> Update Security Password
            </button>
          </div>
        </div>
      </div>

      {/* --- PASSWORD MODAL --- */}
      {showPasswordForm && (
        <div className="fixed inset-0 backdrop-blur-md bg-slate-900/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">
                Change Password
              </h2>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            <form onSubmit={saveNewPassword} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                  Current Password
                </label>
                <PasswordInput
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                    New Password
                  </label>
                  <PasswordInput
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                    Confirm New
                  </label>
                  <PasswordInput
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {isSavingPassword ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={20} />
                )}
                {isSavingPassword ? "Updating..." : "Confirm Update"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
