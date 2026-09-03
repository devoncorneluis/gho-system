"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

type AdminProfile = {
  id: string;
  platform_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  active: boolean | null;
  created_at: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  async function loadProfile() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert(userError?.message || "Unable to identify the logged-in user.");
      return;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select(
        "id, platform_id, full_name, email, role, active, created_at"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      alert(error.message);
      return;
    }

    if (!data) {
      alert("Your GHO profile could not be found.");
      return;
    }

    setProfile(data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
          Admin Profile
        </h1>

        <p className="text-gray-600 mt-2">
          View your GHO admin profile details.
        </p>

        <div className="bg-white rounded-xl shadow p-6 mt-6 max-w-2xl">
          {!profile && <p>Loading profile...</p>}

          {profile && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-[#061B33]">
                  {profile.full_name || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-[#061B33]">
                  {profile.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold text-[#061B33]">
                  {profile.role || "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-semibold text-[#061B33]">
                  {profile.active ? "Active" : "Inactive"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Platform ID</p>
                <p className="font-mono text-sm text-gray-700 break-all">
                  {profile.platform_id || "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-semibold text-[#061B33]">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleString()
                    : "Not available"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}