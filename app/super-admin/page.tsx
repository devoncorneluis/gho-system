"use client";
import ExecutiveKpiCards from "../../components/super-admin/ExecutiveKpiCards";
import { useEffect, useState } from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { supabase } from "../../lib/supabase";
import { TRIP_STATUS } from "../../lib/tripStatus";
import LiveOperationsPanel from "../../components/super-admin/LiveOperationsPanel";
type Platform = {
  id: string;
  name: string;
  company_code: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  billing_cycle_days: number | null;
  active: boolean;
  created_at: string | null;
};

type PlatformAdmin = {
  id: string;
  platform_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  active: boolean | null;
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
const [dashboard, setDashboard] = useState({
  // Executive KPIs
  activeCompanies: 0,
  platformAdmins: 0,
  totalUsers: 0,
  monthlyRevenue: 0,
  outstandingInvoices: 0,
  openSupportTickets: 0,
  systemHealth: 100,

  // Live Operations
  activeTrips: 0,
  onlineDrivers: 0,
  activeVehicles: 0,
  pendingBilling: 0,
  pendingPayroll: 0,
  emergencies: 0,
});
  
async function loadPlatforms() {
  const { data, error } = await supabase
    .from("platforms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  console.log("Platforms from Supabase:", data);
  setPlatforms(data || []);
}
async function loadPlatformAdmins() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.error("No Super Admin session available.");
    return;
  }

  const response = await fetch(
    "/api/create-customer-administrator",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Platform Admin load error:", result);
    alert(
      result.error ||
        "Failed to load Platform Administrators."
    );
    return;
  }

  const admins = result.platform_admins || [];

  console.log(
    "SUPER ADMIN PLATFORM ADMINS:",
    admins
  );

  setPlatformAdmins(admins);

  setDashboard((current) => ({
    ...current,
    platformAdmins: admins.length,
    totalUsers: admins.length,
  }));
}
async function createPlatform() {
  if (!platformName || !companyName || !contactEmail) {
    alert("Platform name, company name, and contact email are required.");
    return;
  }

  const { error } = await supabase.from("platforms").insert({
    name: platformName,
    company_code: companyName,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    billing_cycle_days: 14,
    active: true,
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
async function createCustomerAdministrator() {
console.log({
  adminPlatformId,
  adminName,
  adminEmail,
});

if (!adminPlatformId || !adminName || !adminEmail) {
  alert(
    `Platform ID: ${adminPlatformId}\nName: ${adminName}\nEmail: ${adminEmail}`
  );
  return;
}

  const temporaryPassword =
    adminPasswordNote || "Admin123!";

const {
  data: { session },
} = await supabase.auth.getSession();

const response = await fetch("/api/create-customer-administrator", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
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
    `Customer Administrator created successfully.\n\nEmail: ${adminEmail}\nPassword: ${temporaryPassword}`
  );

  setAdminPlatformId("");
  setAdminName("");
  setAdminEmail("");
  setAdminPasswordNote("");

  loadPlatformAdmins();
}
async function loadDashboard() {
  const [
    { data: platformData, error: platformError },
    { data: adminData, error: adminError },
    trips,
    drivers,
    vehicles,
    billing,
    payroll,
    emergencies,
  ] = await Promise.all([
    supabase
      .from("platforms")
      .select("id"),
    supabase
      .from("user_profiles")
      .select("id, role")
      .eq("role", "admin"),
    supabase.from("trips").select("id,status"),
    supabase.from("drivers").select("id,availability_status"),
    supabase.from("vehicles").select("id,status"),
    supabase.from("billing_records").select("id,billing_status"),
    supabase.from("driver_payroll").select("id,payroll_status"),
    supabase.from("emergency_alerts").select("id,status"),
  ]);

  if (platformError) {
    console.error("Failed to load platforms:", platformError);
  }

  if (adminError) {
    console.error("Failed to load platform administrators:", adminError);
  }

  setDashboard({
    // Executive KPIs
    activeCompanies: platformData?.length ?? 0,
    platformAdmins: adminData?.length ?? 0,
    totalUsers: adminData?.length ?? 0,
    monthlyRevenue: 0,
    outstandingInvoices: 0,
    openSupportTickets: 0,
    systemHealth: 100,

    // Live Operations
    activeTrips:
      trips.data?.filter(
        (t) =>
          t.status === "started" ||
          t.status === "en_route" ||
          t.status === TRIP_STATUS.ASSIGNED ||
          t.status === TRIP_STATUS.IN_TRANSIT
      ).length ?? 0,

    onlineDrivers:
      drivers.data?.filter(
        (d) =>
          d.availability_status === "Online" ||
          d.availability_status === "Available" ||
          d.availability_status === "On Trip"
      ).length ?? 0,

    activeVehicles:
      vehicles.data?.filter(
        (v) =>
          v.status === "Active" ||
          v.status === "Available"
      ).length ?? 0,

    pendingBilling:
      billing.data?.filter(
        (b) =>
          b.billing_status === "pending" ||
          b.billing_status === "Pending"
      ).length ?? 0,

    pendingPayroll:
      payroll.data?.filter(
        (p) =>
          p.payroll_status === "pending" ||
          p.payroll_status === "Pending"
      ).length ?? 0,

    emergencies:
      emergencies.data?.filter(
        (e) =>
          e.status === "active" ||
          e.status === "Active" ||
          e.status === "Open"
      ).length ?? 0,
  });
}
useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadPlatforms();
  loadPlatformAdmins();
  loadDashboard();
}, []);


return (
  <SuperAdminLayout>
    <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
 GHO Platform Administration
        </h1>
<ExecutiveKpiCards dashboard={dashboard} />

<LiveOperationsPanel
  activeTrips={dashboard.activeTrips}
  onlineDrivers={dashboard.onlineDrivers}
  emergencies={dashboard.emergencies}
/>

<p className="text-gray-600 mt-2">
Manage customer companies, platform administrators,
  subscriptions, billing, security and the overall GHO platform.
        </p>

        <section className="mt-10">
  <h2 className="text-3xl font-black text-[#061B33]">
    Customer Management
  </h2>

  <p className="mt-2 text-gray-500">
    Register new customer companies, assign administrators and manage existing customers.
  </p>
</section>

        <div className="mb-4">
  <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
    Step 1
  </span>

  <h3 className="mt-3 text-2xl font-bold text-[#061B33]">
    Create Customer Company
  </h3>

  <p className="mt-1 text-gray-500">
    Register a new company on the GHO platform.
  </p>
</div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Create New Platform</h2>

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

</div>

          <button onClick={createPlatform} className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
            Create Platform
          </button>
        </div>

        <div className="mb-4">
  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
    Step 2
  </span>

  <h3 className="mt-3 text-2xl font-bold text-[#061B33]">
    Create Customer Administrator
  </h3>

  <p className="mt-1 text-gray-500">
    Assign the first administrator who will manage the customer's transport operations.
  </p>
</div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Create Platform Admin</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<select
  value={adminPlatformId}
  onChange={(e) => {
    console.log("Selected Platform:", e.target.value);
    setAdminPlatformId(e.target.value);
  }}
  className="border p-3 rounded-lg"
>
  <option value="">Select Platform</option>

  {platforms.map((platform) => (
<option key={platform.id} value={platform.id}>
  {platform.name}
</option>
  ))}
</select>

            <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="border p-3 rounded-lg" placeholder="Administrator Full Name" />
            <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="border p-3 rounded-lg" placeholder="Administrator Email" />
            <input value={adminPasswordNote} onChange={(e) => setAdminPasswordNote(e.target.value)} className="border p-3 rounded-lg" placeholder="Temporary Password (optional)" />
          </div>

          <button onClick={createCustomerAdministrator} className="mt-6 bg-[#061B33] text-white px-6 py-3 rounded-lg font-bold">
            Create Platform Admin
          </button>
        </div>

        <section className="mt-10">
  <h2 className="text-3xl font-black text-[#061B33]">
    Customer Management
  </h2>

  <p className="mt-2 text-gray-500">
    View and manage customer companies and their administrators.
  </p>
</section>

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
<p><strong>Company Code:</strong> {platform.company_code}</p>
                <p><strong>Contact:</strong> {platform.contact_name}</p>
                <p><strong>Email:</strong> {platform.contact_email}</p>
                <p><strong>Phone:</strong> {platform.contact_phone}</p>
<p><strong>Billing Cycle:</strong> {platform.billing_cycle_days} days</p>
<p>
  <strong>Status:</strong>{" "}
  {platform.active ? "Active" : "Inactive"}
</p>
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
    <p className="text-gray-500">
      No platform admins created yet.
    </p>
  )}

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {platformAdmins.map((admin) => {
      const platform = platforms.find(
        (item) => item.id === admin.platform_id
      );

      return (
        <div
          key={admin.id}
          className="border rounded-xl p-5"
        >
          <p className="text-xl font-bold text-[#061B33]">
            {admin.full_name}
          </p>

          <p>
            <strong>Email:</strong> {admin.email}
          </p>

          <p>
            <strong>Role:</strong> {admin.role}
          </p>

<p>
  <strong>Status:</strong>{" "}
  {admin.active ? "Active" : "Inactive"}
</p>

          <p>
            <strong>Platform:</strong>{" "}
            {platform?.name || admin.platform_id}
          </p>


        </div>
      );
    })}
  </div>
</div>

    </main>
  </SuperAdminLayout>
);
  }
