"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gho.co.za");
  const [password, setPassword] = useState("Admin12345");

  async function signup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("User created. Now check Supabase Authentication → Users, confirm user if needed, then click Login.");
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="min-h-screen bg-[#061B33] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-[#061B33]">GHO</h1>

        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg p-3 mt-6 mb-3" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg p-3 mb-4" type="password" />

        <button onClick={login} className="w-full bg-orange-500 text-white font-bold p-3 rounded-lg mb-3">
          Login
        </button>

        <button onClick={signup} className="w-full bg-[#061B33] text-white font-bold p-3 rounded-lg">
          Create Test User
        </button>
      </div>
    </main>
  );
}
