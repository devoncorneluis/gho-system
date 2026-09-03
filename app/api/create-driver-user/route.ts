import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  authorizePrivilegedRoute,
  isPlatformAssignmentAllowed,
} from "../../../lib/security/privilegedRouteGuard";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authResult = await authorizePrivilegedRoute(request, ["admin"]);

    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { email, full_name, platform_id } = await request.json();

    if (!email || !full_name || !platform_id) {
      return NextResponse.json(
        {
          error:
            "email, full_name, and platform_id are required.",
        },
        { status: 400 }
      );
    }

    if (
      !isPlatformAssignmentAllowed({
        callerRole: authResult.caller.role,
        callerPlatformId: authResult.caller.platformId,
        targetPlatformId: platform_id,
      })
    ) {
      return NextResponse.json(
        {
          error:
            "Caller is not authorized for the requested platform assignment.",
        },
        { status: 403 }
      );
    }

    const origin = new URL(request.url).origin;

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/activate-account`,
        data: {
          full_name,
          role: "driver",
          platform_id,
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const { error: profileError } =
      await supabaseAdmin.from("user_profiles").insert({
id: authData.user.id,
        platform_id,
        full_name,
        email,
        role: "driver",
      });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      invited: true,
      message: `Driver invitation sent to ${email}.`,
    });
  } catch (error) {
    console.error("Create driver user error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}