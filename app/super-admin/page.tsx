"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
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
  billing_frequency: string | null;
  invoice_day: number | null;
  payment_terms: string | null;
  contract_rate: number | null;
  contract_type: string | null;
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
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);

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

    const { error } = await supabase.from("user_profiles").insert({
      platform_id: adminPlatformId,
      full_name: adminName,
      email: adminEmail,
      role: "admin",
      status: "Active",
      password_note:
        adminPasswordNote ||
        "Create user in Supabase Auth, then link user_id later.",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setAdminPlatformId("");
    setAdminName("");
    setAdminEmail("");
    setAdminPasswordNote("");

    loadPlatformAdmins();
  }

  async function savePlatformSettings() {
    if (!editingPlatform) return;

    const { error } = await supabase
      .from("platforms")
      .update({
        company_name: editingPlatform.company_name,
        package_name: editingPlatform.package_name,
        status: editingPlatform.status,
        billing_frequency: editingPlatform.billing_frequency,
        invoice_day: editingPlatform.invoice_day,
        payment_terms: editingPlatform.payment_terms,
        contract_type: editingPlatform.contract_type,
        contract_rate: editingPlatform.contract_rate,
      })
      .eq("id", editingPlatform.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingPlatform(null);
    loadPlatforms();
  }

  useEffect(() => {
    loadPlatforms();
    loadPlatformAdmins();
  }, []);

  const activePlatforms = platforms.filter((platform) => platform.status === "Active").length;
  const starterPlatforms = platforms.filter((platform) => platform.package_name === "Starter").length;
  const professionalPlatforms = platforms.filter((platform) => platform.package_name === "Professional").length;
  const enterprisePlatforms = platforms.filter((platform) => platform.package_name === "Enterprise").length;

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
          Super Admin Portal
        </h1>

        <p className="text-gray-600 mt-2">
          Create and manage client platforms for Corneluis Group Pty Ltd.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Total Platforms</p>
            <p className="text-4xl font-black text-[#061B33]">{platforms.length}</p>
          </div>

          <div className="bg-green-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Active Platforms</p>
            <p className="text-4xl font-black text-green-600">{activePlatforms}</p>
          </div>

          <div className="bg-orange-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Platform Admins</p>
            <p className="text-4xl font-black text-orange-500">{platformAdmins.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Starter</p>
            <p className="text-4xl font-black text-[#061B33]">{starterPlatforms}</p>
          </div>

          <div className="bg-blue-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Professional</p>
            <p className="text-4xl font-black text-blue-600">{professionalPlatforms}</p>
          </div>

          <div className="bg-purple-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Enterprise</p>
            <p className="text-4xl font-black text-purple-600">{enterprisePlatforms}</p>
          </div>
        </div>

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

        {editingPlatform && (
          <div className="bg-white rounded-xl shadow p-6 mt-6 border-2 border-orange-500">
            <h2 className="text-xl font-bold mb-4 text-[#061B33]">
              Edit Platform Settings: {editingPlatform.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={editingPlatform.company_name || ""}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, company_name: e.target.value })}
                className="border p-3 rounded-lg"
                placeholder="Company Name"
              />

              <select
                value={editingPlatform.package_name || "Starter"}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, package_name: e.target.value })}
                className="border p-3 rounded-lg"
              >
                <option>Starter</option>
                <option>Professional</option>
                <option>Enterprise</option>
              </select>

              <select
                value={editingPlatform.status || "Active"}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, status: e.target.value })}
                className="border p-3 rounded-lg"
              >
                <option>Active</option>
                <option>Suspended</option>
                <option>Pending</option>
                <option>Archived</option>
              </select>

              <select
                value={editingPlatform.billing_frequency || "Bi-Weekly"}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, billing_frequency: e.target.value })}
                className="border p-3 rounded-lg"
              >
                <option>Weekly</option>
                <option>Bi-Weekly</option>
                <option>Monthly</option>
                <option>Custom</option>
              </select>

              <input
                type="number"
                value={editingPlatform.invoice_day || 8}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, invoice_day: Number(e.target.value) })}
                className="border p-3 rounded-lg"
                placeholder="Invoice Day"
              />

              <select
                value={editingPlatform.payment_terms || "30 Days"}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, payment_terms: e.target.value })}
                className="border p-3 rounded-lg"
              >
                <option>7 Days</option>
                <option>15 Days</option>
                <option>30 Days</option>
                <option>60 Days</option>
              </select>

              <select
                value={editingPlatform.contract_type || "Per Trip"}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, contract_type: e.target.value })}
                className="border p-3 rounded-lg"
              >
                <option>Per Trip</option>
                <option>Fixed Contract</option>
                <option>Custom</option>
              </select>

              <input
                type="number"
                value={editingPlatform.contract_rate || 0}
                onChange={(e) => setEditingPlatform({ ...editingPlatform, contract_rate: Number(e.target.value) })}
                className="border p-3 rounded-lg"
                placeholder="Contract Rate"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={savePlatformSettings}
                className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold"
              >
                Save Settings
              </button>

              <button
                onClick={() => setEditingPlatform(null)}
                className="bg-gray-600 text-white px-5 py-3 rounded-lg font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
                <p><strong>Billing:</strong> {platform.billing_frequency || "Bi-Weekly"}</p>
                <p><strong>Invoice Day:</strong> {platform.invoice_day || 8}</p>
                <p><strong>Payment Terms:</strong> {platform.payment_terms || "30 Days"}</p>
                <p><strong>Contract:</strong> {platform.contract_type || "Per Trip"} - R{platform.contract_rate || 0}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Platform ID: {platform.id}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditingPlatform(platform)}
                    className="bg-[#061B33] text-white px-4 py-2 rounded-lg font-bold"
                  >
                    ⚙ Edit Settings
                  </button>

                  <a
                    href="/super-admin/billing"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold"
                  >
                    💳 Billing
                  </a>
                </div>
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
    </SuperAdminLayout>
  );
}
