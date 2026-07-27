import { supabaseAdmin } from "./supabaseAdmin";
import { CreateIdentityUser } from "./types";

export async function createIdentityUser({
  email,
  full_name,
  platform_id,
  role,
}: CreateIdentityUser) {
  // Create Auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
    });

  if (authError) {
    throw new Error(authError.message);
  }

  // Create Profile
  const { error: profileError } =
    await supabaseAdmin.from("user_profiles").insert({
      id: authData.user.id,
      email,
      full_name,
      platform_id,
      role,
      active: true,
    });

  if (profileError) {
    // Roll back the auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

    throw new Error(profileError.message);
  }

  return authData.user;
}