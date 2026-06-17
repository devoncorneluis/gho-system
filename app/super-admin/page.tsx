"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

type Platform = {
  id: string;
  name: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  package_name: string | null;
  status: string | null;
  created_at: string | null;
};

type PlatformAdmin = {
  id: string;
  platform_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  password_note: string | null;
  created_at: string | null;
};

export default function SuperAdminPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformAdmins, setPlatformAdmins] = useState<PlatformAdmin[]>([]);

  const [platformName, setPlatformName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [packageName, setPackageName] = useState("Starter");

  const [adminPlatformId, setAdminPlatformId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPasswordNote, setAdminPasswordNote] = useState("");

  async function loadPlatforms() {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPlatforms(data || []);
  }

  async function loadPlatformAdmins() {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPlatformAdmins(data || []);
  }

  async function createPlatform() {
    if (!platformName || !companyName || !contactEmail) {
      alert("Platform name, company name, and contact email are required.");
      return;
    }

    const { error } = await supabase.from("platforms").insert({
      name: platformName,
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      package_name: packageName,
      status: "Active",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setPlatformName("");
    setCompanyName("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setPackageName("Starter");

    loadPlatforms();
  }

async function createPlatformAdmin() {
  if (!adminPlatformId || !adminName || !adminEmail) {
    alert("Platform, admin name, and admin email are required.");
    return;
  }

  const temporaryPassword =
    adminPasswordNote || "Admin123!";

  const response = await fetch("/api/create-platform-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: adminEmail,
      password: temporaryPassword,
      full_name: adminName,
      platform_id: adminPlatformId,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    alert(result.error || "Failed to create admin.");
    return;
  }

  alert(
    `Platform Admin created.\n\nEmail: ${adminEmail}\nPassword: ${temporaryPassword}`
  );

  setAdminPlatformId("");
  setAdminName("");
  setAdminEmail("");
  setAdminPasswordNote("");

  loadPlatformAdmins();
}

  useEffect(() => {
    loadPlatforms();
    loadPlatformAdmins();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
          Super Admin Portal
        </h1>

        <p className="text-gray-600 mt-2">
          Create and manage client platforms for Corneluis Group Pty Ltd.
        </p>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Create New Platform</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="border p-3 rounded-lg" placeholder="Platform Name e.g. ABC Transport" />
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="border p-3 rounded-lg" placeholder="Company Name" />
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="border p-3 rounded-lg" placeholder="Contact Person" />
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="border p-3 rounded-lg" placeholder="Contact Email" />
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="border p-3 rounded-lg" placeholder="Contact Phone" />

            <select value={packageName} onChange={(e) => setPackageName(e.target.value)} className="border p-3 rounded-lg">
              <option>Starter</option>
              <option>Professional</option>
              <option>Enterprise</option>
            </select>
          </div>

          <button onClick={createPlatform} className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
            Create Platform
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Create Platform Admin</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={adminPlatformId} onChange={(e) => setAdminPlatformId(e.target.value)} className="border p-3 rounded-lg">
              <option value="">Select Platform</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} - {platform.company_name}
                </option>
              ))}
            </select>

            <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="border p-3 rounded-lg" placeholder="Admin Full Name" />
            <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="border p-3 rounded-lg" placeholder="Admin Email" />
            <input value={adminPasswordNote} onChange={(e) => setAdminPasswordNote(e.target.value)} className="border p-3 rounded-lg" placeholder="Password note e.g. temporary password" />
          </div>

          <button onClick={createPlatformAdmin} className="mt-6 bg-[#061B33] text-white px-6 py-3 rounded-lg font-bold">
            Create Platform Admin
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Platforms</h2>

          {platforms.length === 0 && (
            <p className="text-gray-500">No platforms created yet.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <div key={platform.id} className="border rounded-xl p-5">
                <p className="text-xl font-bold text-[#061B33]">
                  {platform.name}
                </p>
                <p><strong>Company:</strong> {platform.company_name}</p>
                <p><strong>Contact:</strong> {platform.contact_name}</p>
                <p><strong>Email:</strong> {platform.contact_email}</p>
                <p><strong>Phone:</strong> {platform.contact_phone}</p>
                <p><strong>Package:</strong> {platform.package_name}</p>
                <p><strong>Status:</strong> {platform.status}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Platform ID: {platform.id}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Platform Admins</h2>

          {platformAdmins.length === 0 && (
            <p className="text-gray-500">No platform admins created yet.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformAdmins.map((admin) => {
              const platform = platforms.find(
                (item) => item.id === admin.platform_id
              );

              return (
                <div key={admin.id} className="border rounded-xl p-5">
                  <p className="text-xl font-bold text-[#061B33]">
                    {admin.full_name}
                  </p>
                  <p><strong>Email:</strong> {admin.email}</p>
                  <p><strong>Role:</strong> {admin.role}</p>
                  <p><strong>Status:</strong> {admin.status}</p>
                  <p><strong>Platform:</strong> {platform?.name || admin.platform_id}</p>
                  <p><strong>Password Note:</strong> {admin.password_note || "None"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}