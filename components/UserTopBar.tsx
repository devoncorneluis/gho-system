"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function UserTopBar() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="bg-[#061B33] text-white p-4 flex justify-between items-center">
      <button
        onClick={() => router.back()}
        className="bg-white text-[#061B33] px-4 py-2 rounded-lg font-bold"
      >
        ← Back
      </button>

      <Link href="/" className="font-bold text-xl">
        GHO
      </Link>

      <button
        onClick={logout}
        className="bg-red-600 px-4 py-2 rounded-lg font-bold"
      >
        Logout
      </button>
    </div>
  );
}
