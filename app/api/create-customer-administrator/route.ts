import { NextResponse } from "next/server";
import { logAuditEvent } from "../../../lib/audit/logAuditEvent";
import { supabaseAdmin } from "../../../lib/identity/supabaseAdmin";
import { authorizePrivilegedRoute } from "../../../lib/security/privilegedRouteGuard";
import { createIdentityUser } from "../../../lib/identity/createIdentityUser";
import { sendEmail } from "../../../lib/notifications/sendEmail";
export async function GET(request: Request) {
  try {
    const authResult = await authorizePrivilegedRoute(
      request,
      ["super_admin"]
    );

    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select(
        "id, platform_id, full_name, email, role, active, created_at"
      )
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Platform Administrator load error:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      platform_admins: data || [],
    });
  } catch (error) {
    console.error(
      "Platform Administrator GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await authorizePrivilegedRoute(
      request,
      ["super_admin"]
    );

    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();

    const {
      action = "create",
      email,
      full_name,
      platform_id,
      user_id,
    } = body;

    if (!platform_id) {
      return NextResponse.json(
        { error: "platform_id is required." },
        { status: 400 }
      );
    }

    /*
     * RESEND INVITATION
     */
    if (action === "resend") {
      if (!user_id) {
        return NextResponse.json(
          {
            error: "user_id is required when resending an invitation.",
          },
          { status: 400 }
        );
      }

      const { data: existingAdmin, error: existingAdminError } =
        await supabaseAdmin
          .from("user_profiles")
          .select(
            "id, email, full_name, platform_id, role, active"
          )
          .eq("id", user_id)
          .eq("platform_id", platform_id)
          .eq("role", "admin")
          .maybeSingle();

      if (existingAdminError) {
        return NextResponse.json(
          { error: existingAdminError.message },
          { status: 400 }
        );
      }

      if (!existingAdmin) {
        return NextResponse.json(
          {
            error:
              "The Platform Admin could not be found for this platform.",
          },
          { status: 404 }
        );
      }

      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

const { data: linkData, error: inviteError } =
  await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: existingAdmin.email,
    options: {
      redirectTo: `${origin}/activate-account`,
    },
  });

if (inviteError) {
  console.error(
    "Platform Admin invitation resend error:",
    inviteError
  );

  return NextResponse.json(
    { error: inviteError.message },
    { status: 400 }
  );
}

const activationLink = linkData?.properties?.action_link;
console.log(
  "Generated Platform Admin activation link:",
  activationLink
);
if (!activationLink) {
  return NextResponse.json(
    {
      error: "Platform Admin activation link could not be generated.",
    },
    { status: 400 }
  );
}

await sendEmail({
  to: existingAdmin.email,
  subject: "Activate your GHO Platform Administrator account",
template: "welcome-platform-admin",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #061B33;">Welcome to GHO</h1>

      <p>Hello ${existingAdmin.full_name || "Platform Administrator"},</p>

      <p>
        Your GHO Platform Administrator account is ready.
      </p>

      <p>
        Click the button below to create your secure password
        and activate your account.
      </p>

      <p style="margin: 30px 0;">
        <a
          href="${activationLink}"
          style="
            display: inline-block;
            background: #061B33;
            color: #ffffff;
            padding: 14px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
          "
        >
          Activate My GHO Account
        </a>
      </p>

      <p>
        If you did not request this account, you can safely ignore this email.
      </p>

      <p>
        Regards,<br />
        GHO Platform Administration
      </p>
    </div>
  `,
});

console.log(
  "Platform Admin activation email sent to:",
  existingAdmin.email
);
      await logAuditEvent({
        platform_id,
        user_id: existingAdmin.id,
        entity_type: "user",
        entity_id: existingAdmin.id,
        action: "RESEND_PLATFORM_ADMIN_INVITATION",
        details: {
          email: existingAdmin.email,
          full_name: existingAdmin.full_name,
          role: "admin",
          onboarding: "invitation_resend",
        },
      });

      return NextResponse.json({
        success: true,
        invited: true,
        user_id: existingAdmin.id,
        message: `Platform Admin invitation resent to ${existingAdmin.email}.`,
        email: existingAdmin.email,
      });
    }

    /*
     * REPLACE PLATFORM ADMIN
     */
    if (action === "replace") {
      if (!email || !full_name) {
        return NextResponse.json(
          {
            error:
              "email, full_name, and platform_id are required when replacing a Platform Admin.",
          },
          { status: 400 }
        );
      }

      const { data: existingAdmin, error: existingAdminError } =
        await supabaseAdmin
          .from("user_profiles")
          .select(
            "id, email, full_name, platform_id, role, active"
          )
          .eq("platform_id", platform_id)
          .eq("role", "admin")
          .eq("active", true)
          .maybeSingle();

      if (existingAdminError) {
        return NextResponse.json(
          { error: existingAdminError.message },
          { status: 400 }
        );
      }

      if (!existingAdmin) {
        return NextResponse.json(
          {
            error:
              "No active Platform Admin exists for this platform. Use Create Platform Admin instead.",
          },
          { status: 404 }
        );
      }

      if (existingAdmin.email.toLowerCase() === email.trim().toLowerCase()) {
        return NextResponse.json(
          {
            error:
              "This email already belongs to the current Platform Admin. Use Resend Invitation instead.",
          },
          { status: 400 }
        );
      }

      const newUser = await createIdentityUser({
        email: email.trim(),
        full_name: full_name.trim(),
        platform_id,
        role: "admin",
      });

      const { error: deactivateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          active: false,
        })
        .eq("id", existingAdmin.id)
        .eq("platform_id", platform_id)
        .eq("role", "admin");

      if (deactivateError) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.id);

        return NextResponse.json(
          {
            error:
              "The new Platform Admin was created, but the existing administrator could not be deactivated. No replacement was completed.",
          },
          { status: 400 }
        );
      }

      await logAuditEvent({
        platform_id,
        user_id: newUser.id,
        entity_type: "user",
        entity_id: newUser.id,
        action: "REPLACE_PLATFORM_ADMIN",
        details: {
          email: email.trim(),
          full_name: full_name.trim(),
          role: "admin",
          previous_admin_id: existingAdmin.id,
          previous_admin_email: existingAdmin.email,
          onboarding: "replacement_invitation",
        },
      });

      await logAuditEvent({
        platform_id,
        user_id: existingAdmin.id,
        entity_type: "user",
        entity_id: existingAdmin.id,
        action: "DEACTIVATE_PLATFORM_ADMIN",
        details: {
          email: existingAdmin.email,
          full_name: existingAdmin.full_name,
          replaced_by_user_id: newUser.id,
          replaced_by_email: email.trim(),
          reason: "Platform Admin replacement",
        },
      });

      return NextResponse.json({
        success: true,
        invited: true,
        user_id: newUser.id,
        previous_admin_id: existingAdmin.id,
        message: `Platform Admin replaced successfully. Invitation sent to ${email.trim()}.`,
      });
    }

    /*
     * CREATE PLATFORM ADMIN
     */
    if (!email || !full_name) {
      return NextResponse.json(
        {
          error:
            "email, full_name, and platform_id are required.",
        },
        { status: 400 }
      );
    }

    const { data: existingAdmin, error: existingAdminError } =
      await supabaseAdmin
        .from("user_profiles")
        .select("id, full_name, email")
        .eq("platform_id", platform_id)
        .eq("role", "admin")
        .eq("active", true)
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
            "This platform already has an active Platform Admin. Use Resend Invitation or Replace Platform Admin.",
        },
        { status: 400 }
      );
    }

const user = await createIdentityUser({
  email: email.trim(),
  full_name: full_name.trim(),
  platform_id,
  role: "admin",
});

/*
 * Generate Platform Admin activation link.
 * The email itself is sent through GHO/Resend.
 */
const origin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

console.log(
  "Sending Platform Admin activation email to:",
  email.trim()
);

const { data: linkData, error: inviteError } =
  await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: email.trim(),
    options: {
      redirectTo: `${origin}/activate-account`,
    },
  });

if (inviteError) {
  console.error(
    "Platform Admin activation link generation error:",
    inviteError
  );

  /*
   * The Auth user was created successfully, but onboarding
   * cannot continue without an activation link.
   */
  await supabaseAdmin.auth.admin.deleteUser(user.id);

  return NextResponse.json(
    {
      error:
        "Platform Admin was created, but the activation link could not be generated.",
    },
    { status: 400 }
  );
}

const activationLink = linkData?.properties?.action_link;

console.log(
  "Generated Platform Admin activation link:",
  activationLink
);

if (!activationLink) {
  await supabaseAdmin.auth.admin.deleteUser(user.id);

  return NextResponse.json(
    {
      error:
        "Platform Admin activation link could not be generated.",
    },
    { status: 400 }
  );
}

await sendEmail({
  to: email.trim(),
  subject: "Activate your GHO Platform Administrator account",
  template: "welcome-platform-admin",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #061B33;">Welcome to GHO</h1>

      <p>Hello ${full_name.trim()},</p>

      <p>
        Your GHO Platform Administrator account is ready.
      </p>

      <p>
        Click the button below to create your secure password
        and activate your account.
      </p>

      <p style="margin: 30px 0;">
        <a
          href="${activationLink}"
          style="
            display: inline-block;
            background: #061B33;
            color: #ffffff;
            padding: 14px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
          "
        >
          Activate My GHO Account
        </a>
      </p>

      <p>
        If you did not request this account, you can safely ignore this email.
      </p>

      <p>
        Regards,<br />
        GHO Platform Administration
      </p>
    </div>
  `,
});

console.log(
  "Platform Admin activation email sent to:",
  email.trim()
);

await logAuditEvent({
      platform_id,
      user_id: user.id,
      entity_type: "user",
      entity_id: user.id,
      action: "CREATE_PLATFORM_ADMIN",
      details: {
        email: email.trim(),
        full_name: full_name.trim(),
        role: "admin",
        onboarding: "invitation",
      },
    });

    return NextResponse.json({
      success: true,
      user_id: user.id,
      invited: true,
      message: `Platform Admin invitation sent to ${email.trim()}.`,
    });
  } catch (error) {
    console.error("Create/replace/resend platform admin error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
