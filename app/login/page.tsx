"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    let role: string | null = null;

    const { data: oldProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (oldProfile?.role) {
      role = oldProfile.role;
    }

    if (!role) {
      const { data: newProfile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (newProfile?.role) {
        role = newProfile.role;
      }
    }

    if (!role) {
      alert("No profile role found for this user.");
      return;
    }

    if (role === "super_admin") {
      window.location.href = "/super-admin";
      return;
    }

    if (role === "admin") {
      window.location.href = "/admin";
      return;
    }

    if (role === "driver") {
      window.location.href = "/driver";
      return;
    }

    if (role === "agent") {
      window.location.href = "/agent-tracking";
      return;
    }

    alert("Unknown role: " + role);
  }

  return (
    <main className="min-h-screen bg-[#061B33] relative flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#061B33] via-[#09294d] to-black opacity-95" />

      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white">
        <h1 className="text-5xl font-black text-[#061B33] text-center">
          GHO
        </h1>

        <p className="text-orange-500 font-bold text-center">
          Global Handling Operations
        </p>

        <p className="text-gray-500 text-center text-sm mb-6">
          Powered by Corneluis Group Pty Ltd
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3"
          type="email"
          placeholder="Email address"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl p-3 mb-4"
          type="password"
          placeholder="Password"
        />

        <button
          onClick={login}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-3 rounded-xl"
        >
          Login
        </button>
      </div>
    </main>
  );
}
