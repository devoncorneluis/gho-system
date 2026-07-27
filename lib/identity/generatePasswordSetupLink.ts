import { supabaseAdmin } from "./supabaseAdmin";

export async function generatePasswordSetupLink(email: string) {
  const { data, error } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

  if (error) {
    throw error;
  }

  return data.properties.action_link;
}