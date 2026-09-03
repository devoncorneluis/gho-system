"use client";

import SuperAdminLayout from "../../../components/SuperAdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Platform = {
  id: string;
  name: string;
  company_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  billing_cycle_days: number;
  operation_model: "gho_managed" | "customer_managed";
  active: boolean;
  created_at?: string;
};

type PlatformAdministrator = {
  id: string;
  platform_id: string;
  full_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at?: string;
};

export default function CompaniesPage() {
  const [platformName, setPlatformName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [packageName, setPackageName] = useState("Starter");

  const [operationModel, setOperationModel] = useState<
    "gho_managed" | "customer_managed"
  >("gho_managed");

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [administrators, setAdministrators] = useState<
    PlatformAdministrator[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [editingPlatform, setEditingPlatform] =
    useState<Platform | null>(null);

  const [editPlatformName, setEditPlatformName] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContactName, setEditContactName] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editBillingCycle, setEditBillingCycle] = useState("14");

  const [editOperationModel, setEditOperationModel] = useState<
    "gho_managed" | "customer_managed"
  >("gho_managed");

  async function getSessionToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Your Super Admin session has expired. Please log in again.");
      return null;
    }

    return session.access_token;
  }

  async function loadPlatforms() {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPlatforms((data || []) as Platform[]);
  }

  async function loadAdministrators() {
    const token = await getSessionToken();

    if (!token) {
      return;
    }

    const response = await fetch("/api/create-customer-administrator", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Platform Administrator load error:",
        result.error
      );
      return;
    }

    setAdministrators(
      (result.platform_admins || []) as PlatformAdministrator[]
    );
  }

  async function loadPageData() {
    await Promise.all([loadPlatforms(), loadAdministrators()]);
  }

  useEffect(() => {
    void loadPageData();
  }, []);

  function getAdministrator(platformId: string) {
    return administrators.find(
      (administrator) =>
        administrator.platform_id === platformId &&
        administrator.role === "admin"
    );
  }

  async function createPlatform() {
    if (!platformName || !companyName || !contactEmail) {
      alert(
        "Platform name, company name, and contact email are required."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("platforms").insert({
      name: platformName.trim(),
      company_code: companyName.trim(),
      contact_name: contactName.trim(),
      contact_email: contactEmail.trim(),
      contact_phone: contactPhone.trim(),
      billing_cycle_days: 14,
      operation_model: operationModel,
      active: true,
    });

    setLoading(false);

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
    setOperationModel("gho_managed");

    alert("Customer company created successfully.");

    await loadPageData();
  }

  async function createAdministrator(platform: Platform) {
    const fullName = window.prompt(
      `Create Platform Administrator for ${platform.name}\n\nEnter administrator full name:`
    );

    if (!fullName?.trim()) {
      return;
    }

    const email = window.prompt(
      "Enter the Platform Administrator email address:"
    );

    if (!email?.trim()) {
      return;
    }

    setLoading(true);

    const token = await getSessionToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const response = await fetch(
      "/api/create-customer-administrator",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "create",
          platform_id: platform.id,
          full_name: fullName.trim(),
          email: email.trim(),
        }),
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(
        `Unable to create Platform Administrator.\n\n${
          result.error || "Administrator creation failed."
        }`
      );
      return;
    }

    alert(
      `Platform Administrator created successfully.\n\nInvitation sent to ${email.trim()}.`
    );

    await loadPageData();
  }

  async function resendAdministratorInvitation(
    administrator: PlatformAdministrator
  ) {
    const confirmed = window.confirm(
      `Resend Platform Administrator invitation?\n\n${administrator.full_name}\n${administrator.email}`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const token = await getSessionToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const response = await fetch(
      "/api/create-customer-administrator",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "resend",
          user_id: administrator.id,
          platform_id: administrator.platform_id,
        }),
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(
        `Unable to resend invitation.\n\n${
          result.error || "Invitation resend failed."
        }`
      );
      return;
    }

    alert(
      `Platform Administrator invitation resent to ${administrator.email}.`
    );

    await loadPageData();
  }

  function openEdit(platform: Platform) {
    setEditingPlatform(platform);

    setEditPlatformName(platform.name || "");
    setEditCompanyName(platform.company_code || "");
    setEditContactName(platform.contact_name || "");
    setEditContactEmail(platform.contact_email || "");
    setEditContactPhone(platform.contact_phone || "");
    setEditBillingCycle(
      String(platform.billing_cycle_days || 14)
    );

    setEditOperationModel(
      platform.operation_model || "gho_managed"
    );
  }

  function closeEdit() {
    setEditingPlatform(null);
  }

  async function saveEdit() {
    if (!editingPlatform) {
      return;
    }

    if (
      !editPlatformName ||
      !editCompanyName ||
      !editContactEmail
    ) {
      alert(
        "Platform name, company name, and contact email are required."
      );
      return;
    }

    const billingCycle = Number(editBillingCycle);

    if (!Number.isFinite(billingCycle) || billingCycle <= 0) {
      alert("Billing cycle must be a valid number of days.");
      return;
    }

    setLoading(true);

    const token = await getSessionToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const response = await fetch(
      "/api/super-admin/platforms",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingPlatform.id,
          name: editPlatformName.trim(),
          company_code: editCompanyName.trim(),
          contact_name: editContactName.trim(),
          contact_email: editContactEmail.trim(),
          contact_phone: editContactPhone.trim(),
          billing_cycle_days: billingCycle,
          operation_model: editOperationModel,
        }),
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(
        `Unable to update customer company.\n\n${
          result.error || "Update failed."
        }`
      );
      return;
    }

    closeEdit();

    alert("Customer company updated successfully.");

    await loadPageData();
  }

  async function deletePlatform(platform: Platform) {
    const confirmed = window.confirm(
      `DELETE CUSTOMER COMPANY\n\n` +
        `${platform.name}\n\n` +
        `Platform ID:\n${platform.id}\n\n` +
        `This permanently deletes the platform record and cannot be undone.\n\n` +
        `Are you sure you want to continue?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const token = await getSessionToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const response = await fetch(
      "/api/super-admin/platforms",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: platform.id,
        }),
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(
        `The customer company could not be deleted.\n\n${
          result.error || "Delete failed."
        }`
      );
      return;
    }

    alert(`${platform.name} has been deleted.`);

    await loadPageData();
  }

  async function togglePlatformStatus(platform: Platform) {
    const newStatus = !platform.active;
    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${platform.name}?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const token = await getSessionToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const response = await fetch(
      "/api/super-admin/platforms",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: platform.id,
          active: newStatus,
        }),
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(
        `Unable to ${action} platform.\n\n${
          result.error || "Status update failed."
        }`
      );
      return;
    }

    await loadPageData();
  }

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-[#061B33]">
            Customer Companies
          </h1>

          <p className="mt-2 text-gray-600">
            Manage customer companies, platforms and their Platform
            Administrators from one workspace.
          </p>

          {/* CREATE CUSTOMER COMPANY */}
          <section className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">
              Create New Customer Company
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Customer Company Name"
              />

              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Registered Company Name"
              />

              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Primary Contact"
              />

              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Business Email"
                type="email"
              />

              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Business Phone"
              />

              <select
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="border p-3 rounded-lg"
              >
                <option>Starter</option>
                <option>Professional</option>
                <option>Enterprise</option>
              </select>

              <select
                value={operationModel}
                onChange={(e) =>
                  setOperationModel(
                    e.target.value as
                      | "gho_managed"
                      | "customer_managed"
                  )
                }
                className="border p-3 rounded-lg"
              >
                <option value="gho_managed">
                  GHO Managed
                </option>
                <option value="customer_managed">
                  Customer Managed
                </option>
              </select>
            </div>

            <button
              onClick={createPlatform}
              disabled={loading}
              className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create Customer Company"}
            </button>
          </section>

          {/* CUSTOMER COMPANIES + ADMINISTRATORS */}
          <section className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Customer Companies & Platform Administrators
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Each customer company and its assigned administrator
                  are managed together.
                </p>
              </div>

              <span className="text-sm font-bold text-gray-500">
                {platforms.length}{" "}
                {platforms.length === 1 ? "Company" : "Companies"}
              </span>
            </div>

            {platforms.length === 0 ? (
              <div className="border border-dashed rounded-xl p-10 text-center">
                <p className="text-gray-500">
                  No customer companies created yet.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {platforms.map((platform) => {
                  const administrator = getAdministrator(
                    platform.id
                  );

                  return (
                    <div
                      key={platform.id}
                      className="border rounded-xl overflow-hidden"
                    >
                      {/* COMPANY HEADER */}
                      <div className="bg-gray-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-black text-[#061B33]">
                                {platform.name}
                              </h3>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  platform.active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {platform.active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                              Platform ID: {platform.id}
                            </p>
                          </div>

                          <div className="text-right text-sm">
                            <p className="font-bold text-[#061B33]">
                              {platform.operation_model ===
                              "gho_managed"
                                ? "GHO Managed"
                                : "Customer Managed"}
                            </p>

                            <p className="text-gray-500">
                              Billing:{" "}
                              {platform.billing_cycle_days} days
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-sm">
                          <div>
                            <p className="text-gray-500">
                              Registered Company
                            </p>
                            <p className="font-bold">
                              {platform.company_code}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">
                              Primary Contact
                            </p>
                            <p className="font-bold">
                              {platform.contact_name || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">
                              Business Contact
                            </p>
                            <p className="font-bold">
                              {platform.contact_email}
                            </p>

                            {platform.contact_phone && (
                              <p className="text-gray-600 mt-1">
                                {platform.contact_phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* COMPANY CONTROLS */}
                        <div className="mt-5 pt-4 border-t flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              openEdit(platform)
                            }
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                          >
                            Edit Company
                          </button>

                          <button
                            onClick={() =>
                              togglePlatformStatus(platform)
                            }
                            disabled={loading}
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                          >
                            {platform.active
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            onClick={() =>
                              deletePlatform(platform)
                            }
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                          >
                            Delete Company
                          </button>
                        </div>
                      </div>

                      {/* PLATFORM ADMINISTRATOR */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-black text-[#061B33]">
                              Platform Administrator
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              The administrator who manages this
                              customer platform.
                            </p>
                          </div>

                          {administrator && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                administrator.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {administrator.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          )}
                        </div>

                        {administrator ? (
                          <div className="mt-4 bg-gray-50 border rounded-xl p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <p className="font-black text-[#061B33]">
                                  {administrator.full_name}
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                  {administrator.email}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  resendAdministratorInvitation(
                                    administrator
                                  )
                                }
                                disabled={loading}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                              >
                                Resend Invitation
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 bg-gray-50 border border-dashed rounded-xl p-5">
                            <p className="text-sm text-gray-500">
                              No Platform Administrator created
                              yet.
                            </p>

                            <button
                              onClick={() =>
                                createAdministrator(platform)
                              }
                              disabled={loading}
                              className="mt-3 bg-[#061B33] text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                            >
                              Create Platform Administrator
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* EDIT COMPANY MODAL */}
          {editingPlatform && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-[#061B33]">
                      Edit Customer Company
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Platform ID: {editingPlatform.id}
                    </p>
                  </div>

                  <button
                    onClick={closeEdit}
                    disabled={loading}
                    className="text-gray-500 hover:text-black text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={editPlatformName}
                    onChange={(e) =>
                      setEditPlatformName(e.target.value)
                    }
                    className="border p-3 rounded-lg"
                    placeholder="Customer Company Name"
                  />

                  <input
                    value={editCompanyName}
                    onChange={(e) =>
                      setEditCompanyName(e.target.value)
                    }
                    className="border p-3 rounded-lg"
                    placeholder="Registered Company Name"
                  />

                  <input
                    value={editContactName}
                    onChange={(e) =>
                      setEditContactName(e.target.value)
                    }
                    className="border p-3 rounded-lg"
                    placeholder="Primary Contact"
                  />

                  <input
                    value={editContactEmail}
                    onChange={(e) =>
                      setEditContactEmail(e.target.value)
                    }
                    className="border p-3 rounded-lg"
                    placeholder="Business Email"
                    type="email"
                  />

                  <input
                    value={editContactPhone}
                    onChange={(e) =>
                      setEditContactPhone(e.target.value)
                    }
                    className="border p-3 rounded-lg"
                    placeholder="Business Phone"
                  />

                  <input
                    value={editBillingCycle}
                    onChange={(e) =>
                      setEditBillingCycle(e.target.value)
                    }
                    className="border p-3 rounded-lg"
                    placeholder="Billing Cycle (days)"
                    type="number"
                    min="1"
                  />

                  <select
                    value={editOperationModel}
                    onChange={(e) =>
                      setEditOperationModel(
                        e.target.value as
                          | "gho_managed"
                          | "customer_managed"
                      )
                    }
                    className="border p-3 rounded-lg"
                  >
                    <option value="gho_managed">
                      GHO Managed
                    </option>

                    <option value="customer_managed">
                      Customer Managed
                    </option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeEdit}
                    disabled={loading}
                    className="border border-gray-300 px-5 py-3 rounded-lg font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveEdit}
                    disabled={loading}
                    className="bg-orange-500 text-white px-5 py-3 rounded-lg font-bold disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </SuperAdminLayout>
  );
}