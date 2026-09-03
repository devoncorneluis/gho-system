import { supabaseAdmin } from "./supabaseAdmin";

export async function generatePasswordSetupLink(email: string) {
  const redirectTo =
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/activate-account`
      : "http://localhost:3000/activate-account";

  const { data, error } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo,
      },
    });

  if (error) {
    throw error;
  }

  return data.properties.action_link;
}