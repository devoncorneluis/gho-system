"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type AdminProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  work_place: string | null;
  home_address: string | null;
  vehicle_registration: string | null;
  role: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  async function loadProfile() {
    const { data, error } = await supabase
.from("user_profiles")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .limit(1)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setProfile(data);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Admin Profile</h1>

      <p className="text-gray-600 mt-2">
        View your GHO admin profile details.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6 max-w-2xl">
        {!profile && <p>Loading profile...</p>}

        {profile && (
          <div className="space-y-3">
            <p><strong>Name:</strong> {profile.full_name}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Workplace:</strong> {profile.work_place}</p>
            <p><strong>Home Address:</strong> {profile.home_address}</p>
            <p><strong>Vehicle Registration:</strong> {profile.vehicle_registration}</p>
          </div>
        )}
      </div>
      </main>
    </AdminLayout>
  );
}
