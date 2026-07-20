import { createClient } from "@supabase/supabase-js";

export type PrivilegedCaller = {
  userId: string;
  role: string;
  platformId: string | null;
};

export type GuardResult =
  | { ok: true; caller: PrivilegedCaller }
  | { ok: false; status: number; error: string };

export function isRoleAllowed(role: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(role);
}

export function isPlatformAssignmentAllowed(input: {
  callerRole: string;
  callerPlatformId: string | null;
  targetPlatformId: string | null;
}): boolean {
  const { callerRole, callerPlatformId, targetPlatformId } = input;

  if (callerRole === "super_admin") {
    return true;
  }

  // Non-super-admin callers may only create users in their own platform.
  return Boolean(callerPlatformId && targetPlatformId && callerPlatformId === targetPlatformId);
}

function getBearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!raw) {
    return null;
  }

  const [scheme, token] = raw.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token.trim();
}

export async function authorizePrivilegedRoute(
  request: Request,
  allowedRoles: string[]
): Promise<GuardResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return { ok: false, status: 500, error: "Supabase environment configuration is incomplete." };
  }

  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, error: "Missing or invalid Authorization header." };
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(token);

  if (userError || !user) {
    return { ok: false, status: 401, error: "Unauthorized caller." };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const { data: profile, error: profileError } = await supabaseAdmin
  .from("user_profiles")
  .select("role, platform_id")
  .eq("id", user.id)
  .maybeSingle();

  if (profileError || !profile?.role) {
    return { ok: false, status: 403, error: "Caller profile is missing role authorization." };
  }

  if (!isRoleAllowed(profile.role, allowedRoles)) {
    return { ok: false, status: 403, error: "Caller does not have permission for this operation." };
  }

  return {
    ok: true,
    caller: {
      userId: user.id,
      role: profile.role,
      platformId: profile.platform_id || null,
    },
  };
}
