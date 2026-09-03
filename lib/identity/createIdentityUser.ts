import { supabaseAdmin } from "./supabaseAdmin";
import { CreateIdentityUser } from "./types";

export async function createIdentityUser({
  email,
  password,
  full_name,
  platform_id,
  role,
}: CreateIdentityUser) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  let user;

  if (password) {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
          platform_id,
        },
      });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Supabase user could not be created.");
    }

    user = authData.user;
  } else {
    /*
     * Create the Supabase Auth user without relying on
     * Supabase's email delivery.
     *
     * The caller will generate the activation link and
     * send the email through GHO/Resend.
     */
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: {
          full_name,
          role,
          platform_id,
        },
      });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Supabase user could not be created.");
    }

    user = authData.user;
  }

  const { error: profileError } =
    await supabaseAdmin.from("user_profiles").insert({
      id: user.id,
      email,
      full_name,
      platform_id,
      role,
      active: true,
    });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    throw new Error(profileError.message);
  }

  return user;
}