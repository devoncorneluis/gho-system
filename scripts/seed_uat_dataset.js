#!/usr/bin/env node
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValue.join("=").trim().replace(/^['\"]|['\"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing environment variables: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const RUN_DATE = new Date().toISOString();

const UAT_PLATFORM = {
  id: "c2d0b7d1-6d9f-4a8f-b286-d88ed5e5f001",
  name: "GHO UAT Tenant",
  company_name: "GHO UAT Corporation",
  contact_name: "UAT Control",
  contact_email: "uat-control@gho.example",
  contact_phone: "+27-10-000-0000",
  package_name: "Enterprise",
  status: "Active",
};

const UAT_USERS = [
  {
    profileId: "e3baf0d4-e1af-47f6-a046-21f9a8a11001",
    email: "uat.superadmin@gho.example",
    password: "UAT-SuperAdmin-2026!",
    full_name: "UAT Super Admin",
    role: "super_admin",
    platform_id: UAT_PLATFORM.id,
  },
  {
    profileId: "e3baf0d4-e1af-47f6-a046-21f9a8a11002",
    email: "uat.platformadmin@gho.example",
    password: "UAT-PlatformAdmin-2026!",
    full_name: "UAT Platform Admin",
    role: "admin",
    platform_id: UAT_PLATFORM.id,
  },
  {
    profileId: "e3baf0d4-e1af-47f6-a046-21f9a8a11003",
    email: "uat.dispatcher@gho.example",
    password: "UAT-Dispatcher-2026!",
    full_name: "UAT Dispatcher",
    role: "dispatcher",
    platform_id: UAT_PLATFORM.id,
  },
  {
    profileId: "e3baf0d4-e1af-47f6-a046-21f9a8a11004",
    email: "uat.driver@gho.example",
    password: "UAT-Driver-2026!",
    full_name: "UAT Driver",
    role: "driver",
    platform_id: UAT_PLATFORM.id,
  },
  {
    profileId: "e3baf0d4-e1af-47f6-a046-21f9a8a11005",
    email: "uat.client@gho.example",
    password: "UAT-Client-2026!",
    full_name: "UAT Client",
    role: "client",
    platform_id: UAT_PLATFORM.id,
  },
  {
    profileId: "e3baf0d4-e1af-47f6-a046-21f9a8a11006",
    email: "uat.executive@gho.example",
    password: "UAT-Executive-2026!",
    full_name: "UAT Executive",
    role: "executive",
    platform_id: UAT_PLATFORM.id,
  },
];

const UAT_AGENTS = [
  {
    id: "4df9ce9d-6232-4f0f-b6a4-8d68c9b81001",
    platform_id: UAT_PLATFORM.id,
    employee_number: "UAT-AG-001",
    full_name: "Lerato Ndlovu",
    email: "lerato.ndlovu@gho.example",
    phone: "+27-82-000-1001",
    pickup_area: "Century City",
    work_location: "Cape Town CBD",
    pickup_address: "Century City, Cape Town",
    destination_address: "Foreshore, Cape Town",
    shift: "06:00 - 15:00",
    active: true,
    employee_status: "Active",
  },
  {
    id: "4df9ce9d-6232-4f0f-b6a4-8d68c9b81002",
    platform_id: UAT_PLATFORM.id,
    employee_number: "UAT-AG-002",
    full_name: "Thabo Mokoena",
    email: "thabo.mokoena@gho.example",
    phone: "+27-82-000-1002",
    pickup_area: "Bellville",
    work_location: "Cape Town CBD",
    pickup_address: "Bellville, Cape Town",
    destination_address: "Foreshore, Cape Town",
    shift: "14:00 - 23:00",
    active: true,
    employee_status: "Active",
  },
];

const UAT_VEHICLES = [
  {
    id: "7dc3c470-24d7-4b88-9b0f-3c77bfd41001",
    platform_id: UAT_PLATFORM.id,
    vehicle_name: "UAT Quantum 1",
    registration_number: "CA-UAT-101",
    vehicle_type: "Toyota Quantum",
    vehicle_colour: "White",
    passenger_limit: "15",
    status: "Available",
  },
  {
    id: "7dc3c470-24d7-4b88-9b0f-3c77bfd41002",
    platform_id: UAT_PLATFORM.id,
    vehicle_name: "UAT Ertiga 2",
    registration_number: "CA-UAT-102",
    vehicle_type: "Suzuki Ertiga",
    vehicle_colour: "Silver",
    passenger_limit: "7",
    status: "Available",
  },
];

const UAT_DRIVERS = [
  {
    id: "abaf9f8c-8f35-4c7d-92f5-c7994bdb1001",
    platform_id: UAT_PLATFORM.id,
    driver_no: "UAT-DR-001",
    driver_code: "DR-UAT-001",
    full_name: "Ayanda Khumalo",
    phone: "+27-82-000-2001",
    email: "driver.ayanda@gho.example",
    license_number: "LIC-UAT-001",
    pdp_number: "PDP-UAT-001",
    assigned_vehicle_id: UAT_VEHICLES[0].id,
    assigned_vehicle: `${UAT_VEHICLES[0].vehicle_name} - ${UAT_VEHICLES[0].registration_number}`,
    status: "Available",
    availability_status: "Available",
  },
  {
    id: "abaf9f8c-8f35-4c7d-92f5-c7994bdb1002",
    platform_id: UAT_PLATFORM.id,
    driver_no: "UAT-DR-002",
    driver_code: "DR-UAT-002",
    full_name: "Sipho Dlamini",
    phone: "+27-82-000-2002",
    email: "driver.sipho@gho.example",
    license_number: "LIC-UAT-002",
    pdp_number: "PDP-UAT-002",
    assigned_vehicle_id: UAT_VEHICLES[1].id,
    assigned_vehicle: `${UAT_VEHICLES[1].vehicle_name} - ${UAT_VEHICLES[1].registration_number}`,
    status: "Available",
    availability_status: "Available",
  },
];

const UAT_TRIPS = [
  {
    id: "e5a71b33-6c17-4f6c-aaf3-58735b0f1001",
    platform_id: UAT_PLATFORM.id,
    trip_code: "UAT-TRIP-001",
    trip_date: "2026-07-03",
    shift: "Morning",
    area: "Century City",
    pickup_time: "06:00",
    dropoff_time: "07:00",
    vehicle_type: "Toyota Quantum",
    passenger_count: 8,
    driver_name: UAT_DRIVERS[0].full_name,
    vehicle_name: UAT_VEHICLES[0].vehicle_name,
    vehicle_registration: UAT_VEHICLES[0].registration_number,
    estimated_km: 24,
    status: "Confirmed",
  },
  {
    id: "e5a71b33-6c17-4f6c-aaf3-58735b0f1002",
    platform_id: UAT_PLATFORM.id,
    trip_code: "UAT-TRIP-002",
    trip_date: "2026-07-03",
    shift: "Evening",
    area: "Bellville",
    pickup_time: "18:00",
    dropoff_time: "19:00",
    vehicle_type: "Suzuki Ertiga",
    passenger_count: 4,
    driver_name: UAT_DRIVERS[1].full_name,
    vehicle_name: UAT_VEHICLES[1].vehicle_name,
    vehicle_registration: UAT_VEHICLES[1].registration_number,
    estimated_km: 18,
    status: "Dispatched",
  },
];

const UAT_TRIP_PASSENGERS = [
  {
    id: "f7eea03d-8753-45fe-a77e-bf5d2be51001",
    platform_id: UAT_PLATFORM.id,
    trip_id: UAT_TRIPS[0].id,
    full_name: "Naledi Radebe",
    phone: "+27-82-000-3001",
    pickup_area: "Century City",
    pickup_address: "Canal Walk Entrance",
    pickup_time: "05:55",
    pickup_status: "Pending",
  },
  {
    id: "f7eea03d-8753-45fe-a77e-bf5d2be51002",
    platform_id: UAT_PLATFORM.id,
    trip_id: UAT_TRIPS[1].id,
    full_name: "Kagiso Molefe",
    phone: "+27-82-000-3002",
    pickup_area: "Bellville",
    pickup_address: "Bellville Station",
    pickup_time: "17:50",
    pickup_status: "Pending",
  },
];

const UAT_EMERGENCY_ALERTS = [
  {
    id: "9400fd7d-f0da-46f2-9cb9-72d2ec911001",
    platform_id: UAT_PLATFORM.id,
    driver_name: UAT_DRIVERS[0].full_name,
    vehicle_name: UAT_VEHICLES[0].vehicle_name,
    vehicle_registration: UAT_VEHICLES[0].registration_number,
    alert_type: "SOS",
    emergency_type: "Medical",
    description: "UAT seeded emergency scenario for workflow verification.",
    status: "Open",
    assigned_agent: null,
    resolution_notes: null,
  },
];

function shouldSkipTableError(message) {
  const normalized = message.toLowerCase();
  return normalized.includes("relation") && normalized.includes("does not exist");
}

function extractMissingColumn(message) {
  const match = message.match(/Could not find the '([^']+)' column/i);
  return match?.[1] || null;
}

function extractNotNullColumn(message) {
  const match = message.match(/null value in column "([^"]+)"/i);
  return match?.[1] || null;
}

function defaultValueForRequiredColumn(tableName, columnName, rowIndex) {
  const normalized = columnName.toLowerCase();

  if (normalized === "platform_id") {
    return UAT_PLATFORM.id;
  }

  if (normalized === "company_code") {
    return "UAT-COMPANY";
  }

  if (normalized.endsWith("_at") || normalized === "created_at" || normalized === "updated_at") {
    return RUN_DATE;
  }

  if (normalized === "status") {
    return "Active";
  }

  if (normalized === "role") {
    return "admin";
  }

  if (normalized === "name") {
    return `${tableName}-uat-${rowIndex + 1}`;
  }

  if (normalized === "full_name") {
    return `UAT ${tableName} ${rowIndex + 1}`;
  }

  if (normalized === "email") {
    return `uat.${tableName}.${rowIndex + 1}@gho.example`;
  }

  return null;
}

async function upsertWithColumnFallback(tableName, rows, onConflict) {
  let payload = rows.map((row) => ({ ...row }));

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { error } = await supabase.from(tableName).upsert(payload, { onConflict });

    if (!error) {
      return { success: true, rows: payload.length };
    }

    if (shouldSkipTableError(error.message)) {
      return { success: false, skipped: true, reason: error.message };
    }

    const missingColumn = extractMissingColumn(error.message);
    if (missingColumn) {
      payload = payload.map((row) => {
        const next = { ...row };
        delete next[missingColumn];
        return next;
      });
      continue;
    }

    const requiredColumn = extractNotNullColumn(error.message);
    if (requiredColumn) {
      payload = payload.map((row, index) => {
        if (row[requiredColumn] !== undefined && row[requiredColumn] !== null) {
          return row;
        }

        const fallback = defaultValueForRequiredColumn(tableName, requiredColumn, index);
        if (fallback === null) {
          throw new Error(
            `Failed to seed ${tableName}: required column '${requiredColumn}' has no configured fallback. Original error: ${error.message}`
          );
        }

        return {
          ...row,
          [requiredColumn]: fallback,
        };
      });
      continue;
    }

    throw new Error(`Failed to seed ${tableName}: ${error.message}`);
  }

  throw new Error(`Failed to seed ${tableName}: exceeded retry budget while stripping unknown columns.`);
}

async function upsertTableRows(tableName, rows, options = {}) {
  const onConflict = options.onConflict || "id";

  const result = await upsertWithColumnFallback(tableName, rows, onConflict);
  if (result.skipped) {
    console.warn(`Skipping ${tableName}: ${result.reason}`);
    return;
  }

  console.log(`Seeded ${tableName}: ${result.rows} row(s)`);
}

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const users = data?.users || [];
    const match = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) {
      return match;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser(account) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: {
      full_name: account.full_name,
      role: account.role,
      platform_id: account.platform_id,
      seed: "uat",
      seeded_at: RUN_DATE,
    },
  });

  if (error) {
    if (error.message?.toLowerCase().includes("already") || error.message?.toLowerCase().includes("registered")) {
      const existing = await findUserByEmail(account.email);
      if (!existing) {
        throw new Error(`User ${account.email} already exists but could not be loaded.`);
      }

      return existing;
    }

    throw new Error(`Failed to ensure auth user ${account.email}: ${error.message}`);
  }

  return data.user;
}

async function seedUsers() {
  const profileRoleMap = {
    super_admin: "super_admin",
    admin: "admin",
    dispatcher: "admin",
    driver: "driver",
    client: "admin",
    executive: "admin",
  };

  for (const account of UAT_USERS) {
    const authUser = await ensureAuthUser(account);
    const profileRole = profileRoleMap[account.role] || "admin";

    const profile = {
      id: authUser.id,
      user_id: authUser.id,
      platform_id: account.platform_id,
      full_name: account.full_name,
      email: account.email,
      role: profileRole,
      status: "Active",
      password_note: "Seeded by scripts/seed_uat_dataset.js",
    };

    const result = await upsertWithColumnFallback("user_profiles", [profile], "id");
    if (result.skipped) {
      console.warn(`Skipping user_profiles: ${result.reason}`);
      return;
    }

    console.log(`Seeded user profile: ${account.email}`);
  }
}

async function main() {
  console.log("Starting UAT dataset seed...");

  await upsertTableRows("platforms", [UAT_PLATFORM]);
  await seedUsers();
  await upsertTableRows("agents", UAT_AGENTS);
  await upsertTableRows("vehicles", UAT_VEHICLES);
  await upsertTableRows("drivers", UAT_DRIVERS);
  await upsertTableRows("trips", UAT_TRIPS);
  await upsertTableRows("trip_passengers", UAT_TRIP_PASSENGERS);
  await upsertTableRows("emergency_alerts", UAT_EMERGENCY_ALERTS);

  console.log("UAT dataset seed completed.");
  console.log("Seed tenant:", UAT_PLATFORM.id);
  console.log("Accounts created/ensured:");
  for (const account of UAT_USERS) {
    console.log(`- ${account.role}: ${account.email}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
