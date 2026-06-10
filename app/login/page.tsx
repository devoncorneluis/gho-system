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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      alert("No profile role found for this user.");
      return;
    }

    if (profile.role === "admin") {
      window.location.href = "/admin";
      return;
    }

    if (profile.role === "driver") {
      window.location.href = "/driver";
      return;
    }

    if (profile.role === "agent") {
      window.location.href = "/agent-tracking";
      return;
    }

    alert("Unknown role: " + profile.role);
  }

  return (
    <main className="min-h-screen bg-[#061B33] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-[#061B33]">GHO</h1>
        <p className="text-orange-500 font-semibold mb-6">
          Global Handling Operations
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
          type="email"
          placeholder="Email address"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
          type="password"
          placeholder="Password"
        />

        <button
          onClick={login}
          className="w-full bg-orange-500 text-white font-bold p-3 rounded-lg"
        >
          Login
        </button>
      </div>
    </main>
  );
}
