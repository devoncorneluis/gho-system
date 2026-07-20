import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* eslint-disable @typescript-eslint/no-explicit-any */

const PLATFORM_ID = "00000000-0000-4000-8001-000000000001";
const PLATFORM_NAME = "Cape Town Operations";
const COMPANY_NAME = "Acme Manufacturing";
const STATUS_SCHEMA_VERSION = "1.0";
const SEED_VERSION = "1.0.0";
const RELEASE_BUILD = "v1.0.0-rc1";
const SEED_DIR = path.join(process.cwd(), "supabase", "seed");
const STATUS_FILE = path.join(process.cwd(), ".uat-seed-status.json");
const SQL_FILES = [
  "001_platform.sql",
  "002_platform_admin.sql",
  "003_drivers.sql",
  "004_vehicles.sql",
  "005_agents.sql",
  "006_route_groups.sql",
  "007_trips.sql",
  "008_trip_passengers.sql",
  "009_emergency_data.sql",
];

type SeedSummary = {
  schemaVersion: typeof STATUS_SCHEMA_VERSION;
  seedVersion: typeof SEED_VERSION;
  generatedAt: string;
  build: typeof RELEASE_BUILD;
  platform: string;
  company: string;
  seedStatus: "Seeded" | "Failed";
  drivers: number;
  vehicles: number;
  agents: number;
  routeGroups: number;
  todayTrips: number;
  completedTrips: number;
  futureTrips: number;
  totalTrips: number;
  trips: number;
  passengers: number;
  emergencies: number;
  lastReset: string;
};

type UatAccount = {
  role: string;
  email: string;
  password: string;
  fullName: string;
  profileRole: "super_admin" | "admin" | "driver";
};

type SupabaseAdminClient = ReturnType<typeof createClient<any, "public", any>>;

export const UAT_ACCOUNTS: UatAccount[] = [
  {
    role: "Super Admin",
    email: "superadmin@gho.demo",
    password: "Demo-SuperAdmin-2026!",
    fullName: "UAT Super Admin",
    profileRole: "super_admin",
  },
  {
    role: "Platform Admin",
    email: "admin@gho.demo",
    password: "Demo-PlatformAdmin-2026!",
    fullName: "Operations Manager",
    profileRole: "admin",
  },
  {
    role: "Driver",
    email: "driver1@gho.demo",
    password: "Demo-Driver-2026!",
    fullName: "Aisha Jacobs",
    profileRole: "driver",
  },
  {
    role: "Client",
    email: "client@gho.demo",
    password: "Demo-Client-2026!",
    fullName: "UAT Client",
    profileRole: "admin",
  },
  {
    role: "Executive",
    email: "executive@gho.demo",
    password: "Demo-Executive-2026!",
    fullName: "UAT Executive",
    profileRole: "admin",
  },
];

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValue.join("=").trim().replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name: string, fallback?: string) {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}${fallback ? ` or ${fallback}` : ""}`);
  }

  return value;
}

function runPsql(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("psql", args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`psql exited with code ${code}`));
    });
  });
}

async function runSqlFile(databaseUrl: string, filename: string) {
  const filePath = path.join(SEED_DIR, filename);
  await runPsql([databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", filePath]);
}

export async function clearDemoData(databaseUrl: string) {
  const sql = `
    DELETE FROM public.emergency_alerts WHERE platform_id = '${PLATFORM_ID}';
    DELETE FROM public.trip_passengers WHERE platform_id = '${PLATFORM_ID}';
    DELETE FROM public.trips WHERE platform_id = '${PLATFORM_ID}';
    DELETE FROM public.route_groups WHERE platform_id = '${PLATFORM_ID}';
    DELETE FROM public.agents WHERE platform_id = '${PLATFORM_ID}';
    DELETE FROM public.drivers WHERE platform_id = '${PLATFORM_ID}';
    DELETE FROM public.vehicles WHERE platform_id = '${PLATFORM_ID}';
    DELETE FROM public.user_profiles WHERE platform_id = '${PLATFORM_ID}' OR email LIKE '%@gho.demo';
    DELETE FROM public.platforms WHERE id = '${PLATFORM_ID}';
  `;

  await runPsql([databaseUrl, "-v", "ON_ERROR_STOP=1", "-c", sql]);
}

async function findUserByEmail(supabase: SupabaseAdminClient, email: string) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      return found;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUsers(supabase: SupabaseAdminClient) {
  for (const account of UAT_ACCOUNTS) {
    const existing = await findUserByEmail(supabase, account.email);
    const user =
      existing ||
      (
        await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.fullName,
            role: account.role,
            platform_id: PLATFORM_ID,
            seed: "uat_demo",
          },
        })
      ).data.user;

    if (!user) {
      throw new Error(`Failed to create auth user ${account.email}`);
    }

    if (existing) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: account.password,
        email_confirm: true,
        user_metadata: {
          ...(existing.user_metadata || {}),
          full_name: account.fullName,
          role: account.role,
          platform_id: PLATFORM_ID,
          seed: "uat_demo",
        },
      });

      if (updateError) {
        throw new Error(`Failed to update auth user ${account.email}: ${updateError.message}`);
      }
    }

    const { error: deletePlaceholderError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("email", account.email);

    if (deletePlaceholderError) {
      throw new Error(`Failed to clear stale profile ${account.email}: ${deletePlaceholderError.message}`);
    }

    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        id: user.id,
        user_id: user.id,
        platform_id: PLATFORM_ID,
        full_name: account.fullName,
        email: account.email,
        role: account.profileRole,
        status: "Active",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      throw new Error(`Failed to upsert profile ${account.email}: ${profileError.message}`);
    }
  }
}

async function countRows(
  supabase: SupabaseAdminClient,
  table: string,
  configure?: (query: any) => any
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true }).eq("platform_id", PLATFORM_ID);

  if (configure) {
    query = configure(query) as typeof query;
  }

  const { count, error } = await query;
  if (error) {
    throw new Error(`Failed to count ${table}: ${error.message}`);
  }

  return count || 0;
}

async function verifySeed(supabase: SupabaseAdminClient): Promise<SeedSummary> {
  const today = new Date().toISOString().slice(0, 10);

  const { count: platformCount, error: platformError } = await supabase
    .from("platforms")
    .select("id", { count: "exact", head: true })
    .eq("id", PLATFORM_ID);

  if (platformError) {
    throw new Error(`Failed to verify platform: ${platformError.message}`);
  }

  const summary: SeedSummary = {
    schemaVersion: STATUS_SCHEMA_VERSION,
    seedVersion: SEED_VERSION,
    generatedAt: new Date().toISOString(),
    build: RELEASE_BUILD,
    platform: PLATFORM_NAME,
    company: COMPANY_NAME,
    seedStatus: platformCount === 1 ? "Seeded" : "Failed",
    drivers: await countRows(supabase, "drivers"),
    vehicles: await countRows(supabase, "vehicles"),
    agents: await countRows(supabase, "agents"),
    routeGroups: await countRows(supabase, "route_groups"),
    todayTrips: await countRows(supabase, "trips", (query) => query.eq("trip_date", today)),
    completedTrips: await countRows(supabase, "trips", (query) => query.eq("status", "Completed")),
    futureTrips: await countRows(supabase, "trips", (query) => query.gt("trip_date", today)),
    totalTrips: await countRows(supabase, "trips"),
    trips: 0,
    passengers: await countRows(supabase, "trip_passengers"),
    emergencies: await countRows(supabase, "emergency_alerts", (query) => query.eq("status", "Open")),
    lastReset: new Date().toISOString(),
  };

  summary.trips = summary.todayTrips;

  fs.writeFileSync(STATUS_FILE, `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

function printSummary(summary: SeedSummary) {
  console.log("");
  console.log("✓ Platform created");
  console.log("✓ Admin created");
  console.log(`✓ ${summary.drivers} Drivers`);
  console.log(`✓ ${summary.vehicles} Vehicles`);
  console.log(`✓ ${summary.agents} Agents`);
  console.log(`✓ ${summary.routeGroups} Route Groups`);
  console.log(`✓ ${summary.todayTrips} Today's Trips`);
  console.log(`✓ ${summary.completedTrips} Completed Trips`);
  console.log(`✓ ${summary.futureTrips} Future Trips`);
  console.log(`✓ ${summary.passengers} Passengers`);
  console.log(`✓ ${summary.emergencies} Emergency`);
  console.log("");
  console.log("Seed complete.");
}

export async function seedUat(options: { clear?: boolean } = {}) {
  loadLocalEnv();

  const databaseUrl = requireEnv("DATABASE_URL", "SUPABASE_DB_URL");
  const supabaseUrl = requireEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient<any, "public", any>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (options.clear) {
    await clearDemoData(databaseUrl);
  }

  for (const filename of SQL_FILES) {
    await runSqlFile(databaseUrl, filename);
  }

  await ensureAuthUsers(supabase);
  const summary = await verifySeed(supabase);
  printSummary(summary);
  return summary;
}

const entryPoint = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentFile = fileURLToPath(import.meta.url);

if (entryPoint === currentFile) {
  seedUat({ clear: process.argv.includes("--clear") }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
