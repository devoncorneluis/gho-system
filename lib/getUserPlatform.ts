import { supabase } from "./supabase";

export type UserPlatform = {
  userId: string;
  platformId: string;
  role: string;
  email: string | null;
};

export async function getUserPlatform(): Promise<UserPlatform | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("platform_id, role, email")
    .eq("id", user.id)
    .single();

  console.log("AUTH USER", user);
  console.log("PROFILE", profile);
  console.log("PROFILE ERROR", error);

  if (error || !profile?.role) {
    return null;
  }

  // Super Admins do not belong to a platform
  if (profile.role !== "super_admin" && !profile.platform_id) {
    return null;
  }

  return {
    userId: user.id,
    platformId: profile.platform_id ?? "",
    role: profile.role,
    email: profile.email || user.email || null,
  };
}