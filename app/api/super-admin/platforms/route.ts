import { NextResponse } from "next/server";
import { authorizePrivilegedRoute } from "../../../../lib/security/privilegedRouteGuard";
import { supabaseAdmin } from "../../../../lib/identity/supabaseAdmin";

export async function PATCH(request: Request) {
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
  id,
  name,
  company_code,
  contact_name,
  contact_email,
  contact_phone,
  billing_cycle_days,
  operation_model,
} = body;

    if (!id || !name || !company_code || !contact_email) {
      return NextResponse.json(
        {
          error:
            "id, name, company_code, and contact_email are required.",
        },
        { status: 400 }
      );
    }
if (
  operation_model !== "gho_managed" &&
  operation_model !== "customer_managed"
) {
  return NextResponse.json(
    {
      error:
        "operation_model must be either gho_managed or customer_managed.",
    },
    { status: 400 }
  );
}
    const billingCycle = Number(billing_cycle_days);

    if (!Number.isFinite(billingCycle) || billingCycle <= 0) {
      return NextResponse.json(
        {
          error: "billing_cycle_days must be a valid positive number.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("platforms")
      .update({
        name: String(name).trim(),
        company_code: String(company_code).trim(),
        contact_name: String(contact_name).trim(),
        contact_email: String(contact_email).trim(),
        contact_phone: String(contact_phone).trim(),
        billing_cycle_days: billingCycle,
        operation_model,
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Super Admin platform update error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Platform was not found or could not be updated.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      platform: data,
    });
  } catch (error) {
    console.error("Super Admin platform PATCH error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Server error",
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
    const { id, active } = body;

    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        {
          error: "id and active are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("platforms")
      .update({
        active,
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error(
        "Super Admin platform status update error:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Platform was not found or its status could not be updated.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      platform: data,
    });
  } catch (error) {
    console.error("Super Admin platform POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Platform id is required." },
        { status: 400 }
      );
    }

    const { data: platform, error: platformLookupError } =
      await supabaseAdmin
        .from("platforms")
        .select("id, name")
        .eq("id", id)
        .maybeSingle();

    if (platformLookupError) {
      return NextResponse.json(
        { error: platformLookupError.message },
        { status: 400 }
      );
    }

    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found." },
        { status: 404 }
      );
    }

    // Capture customer Auth user IDs before user_profiles are
    // removed by the platform CASCADE.
    const { data: customerProfiles, error: customerProfilesError } =
      await supabaseAdmin
        .from("user_profiles")
        .select("id, role")
        .eq("platform_id", id);

    if (customerProfilesError) {
      console.error(
        "Platform customer profile lookup error:",
        customerProfilesError
      );

      return NextResponse.json(
        {
          error:
            "Platform could not be deleted because customer accounts could not be identified.",
        },
        { status: 400 }
      );
    }

    const customerUserIds = (customerProfiles || [])
      .filter((profile) => profile.role !== "super_admin")
      .map((profile) => profile.id);

    // Remove records that directly prevent deletion because of
    // NO ACTION foreign keys.

    const { data: platformTrips, error: tripsLookupError } =
      await supabaseAdmin
        .from("trips")
        .select("id")
        .eq("platform_id", id);

    if (tripsLookupError) {
      console.error(
        "Platform trips lookup error:",
        tripsLookupError
      );

      return NextResponse.json(
        { error: "Could not identify platform trips." },
        { status: 400 }
      );
    }

    const tripIds = (platformTrips || []).map((trip) => trip.id);

    if (tripIds.length > 0) {
      const { error: emergencyError } = await supabaseAdmin
        .from("emergency_alerts")
        .delete()
        .in("trip_id", tripIds);

      if (emergencyError) {
        console.error(
          "Platform emergency alert cleanup error:",
          emergencyError
        );

        return NextResponse.json(
          {
            error:
              "Platform could not be deleted because emergency alerts could not be removed.",
          },
          { status: 400 }
        );
      }

      const { error: supportTripError } = await supabaseAdmin
        .from("support_tickets")
        .delete()
        .in("trip_id", tripIds);

      if (supportTripError) {
        console.error(
          "Platform trip support ticket cleanup error:",
          supportTripError
        );

        return NextResponse.json(
          {
            error:
              "Platform could not be deleted because trip support tickets could not be removed.",
          },
          { status: 400 }
        );
      }
    }

    // Remove platform-level NO ACTION records.
    const { error: notificationError } = await supabaseAdmin
      .from("notification_logs")
      .delete()
      .eq("platform_id", id);

    if (notificationError) {
      console.error(
        "Platform notification log cleanup error:",
        notificationError
      );

      return NextResponse.json(
        {
          error:
            "Platform could not be deleted because notification logs could not be removed.",
        },
        { status: 400 }
      );
    }

    const { error: supportTicketError } = await supabaseAdmin
      .from("support_tickets")
      .delete()
      .eq("platform_id", id);

    if (supportTicketError) {
      console.error(
        "Platform support ticket cleanup error:",
        supportTicketError
      );

      return NextResponse.json(
        {
          error:
            "Platform could not be deleted because support tickets could not be removed.",
        },
        { status: 400 }
      );
    }

    // The platform CASCADE will now remove the platform-owned
    // operational records.
    const { error: deleteError } = await supabaseAdmin
      .from("platforms")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Super Admin platform delete error:",
        deleteError
      );

      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    // Finally remove the customer's Supabase Auth accounts.
    // Super Admin accounts are explicitly excluded above.
    for (const userId of customerUserIds) {
      const { error: authDeleteError } =
        await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.error(
          `Failed to delete customer Auth user ${userId}:`,
          authDeleteError
        );

        return NextResponse.json(
          {
            error:
              "Platform was deleted, but one or more customer Auth accounts could not be removed.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `${platform.name} has been permanently deleted.`,
      platform_id: id,
      deleted_customer_users: customerUserIds.length,
    });
  } catch (error) {
    console.error(
      "Super Admin platform DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}