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

type PlatformAdmin = {
  id: string;
  platform_id: string;
  full_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at?: string;
};

export default function CustomerAdministratorsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformAdmins, setPlatformAdmins] = useState<PlatformAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [platformName, setPlatformName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [billingCycle, setBillingCycle] = useState("14");
  const [operationModel, setOperationModel] = useState<
    "gho_managed" | "customer_managed"
  >("gho_managed");

  const [adminPlatformId, setAdminPlatformId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

async function loadData() {
  setLoading(true);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    setLoading(false);
    alert(
      "Your Super Admin session has expired. Please log in again."
    );
    return;
  }

  const [platformResult, adminResponse] = await Promise.all([
    supabase
      .from("platforms")
      .select(
        "id, name, company_code, contact_name, contact_email, contact_phone, billing_cycle_days, operation_model, active, created_at"
      )
      .order("created_at", { ascending: false }),

    fetch("/api/create-customer-administrator", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }),
  ]);

  if (platformResult.error) {
    setLoading(false);
    alert(platformResult.error.message);
    return;
  }

  const adminJson = await adminResponse.json();

  if (!adminResponse.ok) {
    setLoading(false);
    alert(
      adminJson.error ||
        "Failed to load Platform Administrators."
    );
    return;
  }

  setPlatforms((platformResult.data || []) as Platform[]);
  setPlatformAdmins(
    (adminJson.platform_admins || []) as PlatformAdmin[]
  );

  setLoading(false);
}
  useEffect(() => {
    void loadData();
  }, []);

  function resetCreateForm() {
    setPlatformName("");
    setCompanyCode("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setBillingCycle("14");
    setOperationModel("gho_managed");
    setAdminPlatformId("");
    setAdminName("");
    setAdminEmail("");
  }

  async function createCustomer() {
    if (
      !platformName.trim() ||
      !companyCode.trim() ||
      !contactEmail.trim()
    ) {
      alert(
        "Company name, company code and contact email are required."
      );
      return;
    }

    if (!adminName.trim() || !adminEmail.trim()) {
      alert(
        "Platform Administrator name and email are required."
      );
      return;
    }

    const cycle = Number(billingCycle);

    if (!Number.isFinite(cycle) || cycle <= 0) {
      alert("Billing cycle must be a valid number of days.");
      return;
    }

    setLoading(true);

    const { data: platform, error: platformError } =
      await supabase
        .from("platforms")
        .insert({
          name: platformName.trim(),
          company_code: companyCode.trim(),
          contact_name: contactName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          billing_cycle_days: cycle,
          operation_model: operationModel,
          active: true,
        })
        .select()
        .single();

    if (platformError || !platform) {
      setLoading(false);
      alert(
        platformError?.message ||
          "Customer company could not be created."
      );
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      await supabase
        .from("platforms")
        .delete()
        .eq("id", platform.id);

      setLoading(false);
      alert(
        "Your Super Admin session has expired. Please log in again."
      );
      return;
    }

    const adminResponse = await fetch(
      "/api/create-customer-administrator",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "create",
          email: adminEmail.trim(),
          full_name: adminName.trim(),
          platform_id: platform.id,
        }),
      }
    );

    const adminResult = await adminResponse.json();

    if (!adminResponse.ok) {
      await supabase
        .from("platforms")
        .delete()
        .eq("id", platform.id);

      setLoading(false);

      alert(
        `Customer company was not completed.\n\n${
          adminResult.error ||
          "Platform Administrator could not be created."
        }`
      );

      return;
    }

    setLoading(false);
    setShowCreate(false);

    alert(
      `Customer created successfully.\n\n` +
        `Company: ${platform.name}\n` +
        `Platform Administrator: ${adminEmail.trim()}\n\n` +
        `The activation email has been sent to the administrator's email address.`
    );

    resetCreateForm();
    await loadData();
  }

  async function resendInvitation(admin: PlatformAdmin) {
    const confirmed = window.confirm(
      `RESEND INVITATION\n\n` +
        `${admin.full_name}\n` +
        `${admin.email}\n\n` +
        `Send a new GHO activation email to this administrator?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setLoading(false);
      alert(
        "Your Super Admin session has expired. Please log in again."
      );
      return;
    }

    const response = await fetch(
      "/api/create-customer-administrator",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "resend",
          user_id: admin.id,
          platform_id: admin.platform_id,
        }),
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(
        result.error ||
          "The invitation could not be resent."
      );
      return;
    }

    alert(
      `Invitation sent successfully.\n\n${admin.email}`
    );
  }

  function getAdminForPlatform(platformId: string) {
    return platformAdmins.find(
      (admin) =>
        admin.platform_id === platformId && admin.active
    );
  }

  const activePlatforms = platforms.filter(
    (platform) => platform.active
  ).length;

  const activeAdmins = platformAdmins.filter(
    (admin) => admin.active
  ).length;

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                GHO Super Admin
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#061B33] md:text-4xl">
                Customer Management
              </h1>

              <p className="mt-2 max-w-2xl text-gray-600">
                Manage customer companies, their GHO platforms,
                Platform Administrators and account invitations
                from one place.
              </p>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              disabled={loading}
              className="rounded-xl bg-[#061B33] px-6 py-3 font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
            >
              + Add Customer Company
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm font-semibold text-gray-500">
                Active Customer Companies
              </p>
              <p className="mt-2 text-3xl font-black text-[#061B33]">
                {activePlatforms}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm font-semibold text-gray-500">
                Platform Administrators
              </p>
              <p className="mt-2 text-3xl font-black text-[#061B33]">
                {activeAdmins}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm font-semibold text-gray-500">
                Customer Accounts
              </p>
              <p className="mt-2 text-3xl font-black text-[#061B33]">
                {platforms.length}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-[#061B33]">
                Customer Companies
              </h2>
              <p className="mt-1 text-gray-500">
                Each customer is shown together with its
                Platform Administrator.
              </p>
            </div>

            {loading && platforms.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <p className="font-semibold text-gray-600">
                  Loading customer accounts...
                </p>
              </div>
            ) : platforms.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <h3 className="text-xl font-bold text-[#061B33]">
                  No customer companies yet
                </h3>

                <p className="mt-2 text-gray-500">
                  Create your first GHO customer company to get
                  started.
                </p>

                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"
                >
                  + Add Customer Company
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {platforms.map((platform) => {
                  const admin = getAdminForPlatform(platform.id);

                  return (
                    <div
                      key={platform.id}
                      className="rounded-2xl bg-white p-6 shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-black text-[#061B33]">
                            {platform.name}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-gray-500">
                            Company Code: {platform.company_code}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            platform.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {platform.active
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </div>

                      <div className="mt-6 border-t pt-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Company
                        </p>

                        <div className="mt-3 space-y-2 text-sm">
                          <p>
                            <strong>Contact:</strong>{" "}
                            {platform.contact_name || "—"}
                          </p>

                          <p>
                            <strong>Email:</strong>{" "}
                            {platform.contact_email || "—"}
                          </p>

                          <p>
                            <strong>Phone:</strong>{" "}
                            {platform.contact_phone || "—"}
                          </p>

                          <p>
                            <strong>Billing:</strong>{" "}
                            {platform.billing_cycle_days} days
                          </p>

                          <p>
                            <strong>Operation:</strong>{" "}
                            {platform.operation_model ===
                            "customer_managed"
                              ? "Customer Managed"
                              : "GHO Managed"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 border-t pt-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Platform Administrator
                          </p>

                          {admin && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        {admin ? (
                          <div className="mt-3 rounded-xl bg-gray-50 p-4">
                            <p className="font-bold text-[#061B33]">
                              {admin.full_name}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              {admin.email}
                            </p>

                            <p className="mt-1 text-xs font-semibold uppercase text-gray-400">
                              {admin.role}
                            </p>

                            <button
                              onClick={() =>
                                resendInvitation(admin)
                              }
                              disabled={loading}
                              className="mt-4 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-50"
                            >
                              Resend Invitation
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p className="font-bold text-orange-800">
                              No active Platform Administrator
                            </p>

                            <p className="mt-1 text-sm text-orange-700">
                              This customer still needs an
                              administrator.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 border-t pt-4">
                        <p className="text-xs text-gray-400">
                          Platform ID: {platform.id}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-orange-500">
                      New Customer
                    </p>

                    <h2 className="mt-1 text-3xl font-black text-[#061B33]">
                      Add Customer Company
                    </h2>

                    <p className="mt-2 text-gray-500">
                      Create the customer company and its first
                      Platform Administrator together.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowCreate(false);
                      resetCreateForm();
                    }}
                    disabled={loading}
                    className="rounded-lg px-3 py-2 text-2xl font-bold text-gray-400 hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-black text-[#061B33]">
                    Company Information
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      value={platformName}
                      onChange={(e) =>
                        setPlatformName(e.target.value)
                      }
                      placeholder="Customer Company Name"
                      className="rounded-lg border p-3"
                    />

                    <input
                      value={companyCode}
                      onChange={(e) =>
                        setCompanyCode(e.target.value)
                      }
                      placeholder="Company Code"
                      className="rounded-lg border p-3"
                    />

                    <input
                      value={contactName}
                      onChange={(e) =>
                        setContactName(e.target.value)
                      }
                      placeholder="Company Contact Name"
                      className="rounded-lg border p-3"
                    />

                    <input
                      value={contactEmail}
                      onChange={(e) =>
                        setContactEmail(e.target.value)
                      }
                      placeholder="Company Contact Email"
                      type="email"
                      className="rounded-lg border p-3"
                    />

                    <input
                      value={contactPhone}
                      onChange={(e) =>
                        setContactPhone(e.target.value)
                      }
                      placeholder="Company Contact Phone"
                      className="rounded-lg border p-3"
                    />

                    <select
                      value={operationModel}
                      onChange={(e) =>
                        setOperationModel(
                          e.target.value as
                            | "gho_managed"
                            | "customer_managed"
                        )
                      }
                      className="rounded-lg border p-3"
                    >
                      <option value="gho_managed">
                        GHO Managed
                      </option>
                      <option value="customer_managed">
                        Customer Managed
                      </option>
                    </select>

                    <input
                      value={billingCycle}
                      onChange={(e) =>
                        setBillingCycle(e.target.value)
                      }
                      type="number"
                      min="1"
                      placeholder="Billing Cycle Days"
                      className="rounded-lg border p-3"
                    />
                  </div>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-black text-[#061B33]">
                    Platform Administrator
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    The activation email will be sent to this
                    exact email address.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      value={adminName}
                      onChange={(e) =>
                        setAdminName(e.target.value)
                      }
                      placeholder="Administrator Full Name"
                      className="rounded-lg border p-3"
                    />

                    <input
                      value={adminEmail}
                      onChange={(e) =>
                        setAdminEmail(e.target.value)
                      }
                      placeholder="Administrator Email"
                      type="email"
                      className="rounded-lg border p-3"
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      resetCreateForm();
                    }}
                    disabled={loading}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-bold text-gray-700"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={createCustomer}
                    disabled={loading}
                    className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {loading
                      ? "Creating Customer..."
                      : "Create Customer"}
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
