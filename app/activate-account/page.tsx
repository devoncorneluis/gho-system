"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ActivateAccountPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function establishInvitationSession() {
      try {
        console.log("GHO activation: checking Supabase session");

        /*
         * Supabase invitation links can use either:
         * 1. PKCE ?code=...
         * 2. Recovery tokens in the URL hash.
         */

        const searchParams = new URLSearchParams(
          window.location.search
        );

        const code = searchParams.get("code");

        if (code) {
          console.log(
            "GHO activation: authorization code detected"
          );

          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error(
              "GHO activation code exchange error:",
              exchangeError
            );
          }
        }

        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log(
            "GHO activation: recovery tokens detected"
          );

          const { error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (sessionError) {
            console.error(
              "GHO activation session error:",
              sessionError
            );
          }
        }

        const {
          data: { session },
          error: sessionLookupError,
        } = await supabase.auth.getSession();

        if (sessionLookupError) {
          console.error(
            "GHO activation session lookup error:",
            sessionLookupError
          );
        }

        if (session?.user) {
          console.log(
            "GHO activation: authenticated user:",
            session.user.email
          );

          if (mounted) {
            setEmail(session.user.email || "");
            setLoading(false);
          }

          window.history.replaceState(
            {},
            document.title,
            "/activate-account"
          );

          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log(
              "GHO activation auth event:",
              event
            );

            if (!mounted) {
              return;
            }

            if (session?.user) {
              console.log(
                "GHO activation: session established:",
                session.user.email
              );

              setEmail(session.user.email || "");
              setLoading(false);

              subscription.unsubscribe();
            }
          }
        );

        setTimeout(async () => {
          if (!mounted) {
            subscription.unsubscribe();
            return;
          }

          const {
            data: { session: latestSession },
          } = await supabase.auth.getSession();

          if (latestSession?.user) {
            console.log(
              "GHO activation: session established on retry:",
              latestSession.user.email
            );

            setEmail(latestSession.user.email || "");
            setLoading(false);

            subscription.unsubscribe();
            return;
          }

          subscription.unsubscribe();

          setErrorMessage(
            "This invitation link is invalid or has expired. Please request a new invitation."
          );

          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error(
          "GHO activation session error:",
          error
        );

        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "This invitation link is invalid or has expired."
          );

          setLoading(false);
        }
      }
    }

    void establishInvitationSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function activateAccount() {
    if (!password) {
      alert("Please create a password.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }

    await supabase.auth.signOut();

    alert("Your GHO account has been activated successfully.");

    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <p className="text-gray-600 font-semibold">
            Activating your GHO invitation...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10">
          <h1 className="text-4xl font-black text-[#061B33]">
            GHO Invitation
          </h1>

          <p className="mt-4 text-red-600 font-semibold">
            {errorMessage}
          </p>

          <p className="mt-4 text-gray-600">
            Please request a new Platform Administrator invitation if
            this invitation has expired or has already been used.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-4xl font-black text-[#061B33]">
          Welcome to GHO
        </h1>

        <p className="mt-3 text-gray-600">
          Create your secure password to activate your GHO account.
        </p>

        {email && (
          <div className="mt-6 bg-gray-50 border rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Account email
            </p>

            <p className="font-bold text-[#061B33]">
              {email}
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <button
            onClick={activateAccount}
            disabled={saving}
            className="w-full bg-orange-500 text-white font-bold rounded-lg p-4 disabled:opacity-50"
          >
            {saving
              ? "Activating Account..."
              : "Activate My Account"}
          </button>
        </div>
      </div>
    </main>
  );
}