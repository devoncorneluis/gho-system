import { supabase } from "./supabase";

export async function getCurrentUserRole() {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

  if (profileError) {
    console.error("Failed to load current user profile:", profileError);
    return null;
  }

  return profile?.role || null;
}