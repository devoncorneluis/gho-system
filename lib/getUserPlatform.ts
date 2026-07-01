
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
if (error || !profile?.platform_id || !profile?.role) {
  console.log("GET USER PLATFORM FAILED", {
    user,
    profile,
    error,
  });

  return null;
}
console.log("AUTH USER", user);
console.log("PROFILE", profile);
console.log("PROFILE ERROR", error);

  if (error || !profile?.platform_id || !profile?.role) {
    return null;
  }

  return {
    userId: user.id,
    platformId: profile.platform_id,
    role: profile.role,
    email: profile.email || user.email || null,
  };
}