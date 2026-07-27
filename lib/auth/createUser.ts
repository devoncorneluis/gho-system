import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type CreateUserOptions = {
  email: string;
};

export async function createUser({
  email,
}: CreateUserOptions) {
  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}