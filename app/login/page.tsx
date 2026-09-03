"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function forgotPassword() {
    if (!email.trim()) {
      alert("Enter your email address first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
redirectTo: "http://localhost:3000/reset-password",
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset email sent.");
  }

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
  .from("user_profiles")
  .select("role")
  .eq("id", data.user.id)
  .maybeSingle();

if (profileError) {
  alert(profileError.message);
  return;
}

if (!profile?.role) {
  alert("No profile role found for this user.");
  return;
}

switch (profile.role) {
  case "super_admin":
    window.location.href = "/super-admin";
    return;

  case "admin":
    window.location.href = "/admin";
    return;

  case "driver":
    window.location.href = "/driver";
    return;

  case "agent":
    window.location.href = "/agent-tracking";
    return;

  default:
    alert("Unsupported profile role.");
    }
}
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-black">
            G
          </div>
          <h1 className="text-3xl font-black text-[#061B33]">GHO</h1>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-4 text-gray-800 text-xl font-semibold">
            <span className="text-orange-500">📍</span>
            <span>Transport Bookings</span>
          </div>

          <div className="flex items-center gap-4 text-gray-800 text-xl font-semibold">
            <span className="text-orange-500">👤</span>
            <span>Profile Management</span>
          </div>

          <div className="flex items-center gap-4 text-gray-800 text-xl font-semibold">
            <span className="text-orange-500">📊</span>
            <span>Operations Analytics</span>
          </div>

          <div className="flex items-center gap-4 text-gray-800 text-xl font-semibold">
            <span className="text-orange-500">💬</span>
            <span>Notifications</span>
          </div>
        </div>

        <div className="border-t pt-6">
          <p className="text-gray-500 font-semibold mb-4">
            Sign in to GHO
          </p>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-2xl p-4 mb-3"
            type="email"
            placeholder="Email address"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-2xl p-4 mb-5"
            type="password"
            placeholder="Password"
          />

          <button
            onClick={login}
            className="w-full bg-black text-white font-bold p-4 rounded-2xl shadow-lg"
          >
            Login
          </button>

          <button
            onClick={forgotPassword}
            className="w-full mt-3 text-blue-600 font-semibold"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </main>
  );
}