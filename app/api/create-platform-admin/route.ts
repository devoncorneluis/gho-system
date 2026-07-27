import { NextResponse } from "next/server";
import { logAuditEvent } from "../../../lib/audit/logAuditEvent";
import { createClient } from "@supabase/supabase-js";
import { authorizePrivilegedRoute } from "../../../lib/security/privilegedRouteGuard";
import { createIdentityUser } from "../../../lib/identity/createIdentityUser";
import { generatePasswordSetupLink } from "../../../lib/identity/generatePasswordSetupLink";
import { welcomePlatformAdmin } from "../../../lib/notifications/templates/welcomePlatformAdmin";
import { sendEmail } from "../../../lib/notifications/sendEmail";
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authResult = await authorizePrivilegedRoute(request, ["super_admin"]);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

const {
  email,
  full_name,
  platform_id,
} = await request.json();

if (!email || !full_name || !platform_id) {
  return NextResponse.json(
    { error: "email, full_name, and platform_id are required." },
    { status: 400 }
  );
}
// Check if this platform already has a Platform Admin
const { data: existingAdmin, error: existingAdminError } =
  await supabaseAdmin
    .from("user_profiles")
    .select("id, full_name")
    .eq("platform_id", platform_id)
    .eq("role", "admin")
    .maybeSingle();

if (existingAdminError) {
  return NextResponse.json(
    { error: existingAdminError.message },
    { status: 400 }
  );
}

if (existingAdmin) {
  return NextResponse.json(
    {
      error:
        "This platform already has a Platform Admin. Edit or replace the existing Platform Admin instead.",
    },
    { status: 400 }
  );
}

const { error: inviteError } =
  await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

if (inviteError) {
  return NextResponse.json(
    { error: inviteError.message },
    { status: 400 }
  );
}
const user = await createIdentityUser({
  email,
  full_name,
  platform_id,
  role: "admin",
});
await logAuditEvent({
  platform_id,
  user_id: user.id,
  entity_type: "user",
  entity_id: user.id,
  action: "CREATE_PLATFORM_ADMIN",
  details: {
    email,
    full_name,
    role: "admin",
  },
});
const passwordLink = await generatePasswordSetupLink(email);
const emailContent = welcomePlatformAdmin(
  full_name,
  "GHO Platform",
  passwordLink
);
await sendEmail({
  to: email,
  subject: emailContent.subject,
  html: emailContent.html,
  template: "welcome-platform-admin",
});
return NextResponse.json({
  success: true,
  user_id: user.id,
});
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}