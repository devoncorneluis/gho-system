"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";

type NotificationLog = {
  id: string;
  platform_id: string | null;
  trip_id: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  notification_type: string | null;
  channel: string | null;
  message: string | null;
  status: string | null;
  read_at: string | null;
  created_at: string | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [userEmail, setUserEmail] = useState("");

  async function loadNotifications() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }

    setUserEmail(userPlatform.email || "");

const { data, error } = await supabase
  .from("notification_logs")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(100);

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications(data || []);
  }

  async function markRead(id: string) {
    const { error } = await supabase
      .from("notification_logs")
      .update({
        read_at: new Date().toISOString(),
        status: "Read",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadNotifications();
  }

  async function markAllRead() {
    if (!userEmail) return;

    const { error } = await supabase
      .from("notification_logs")
      .update({
        read_at: new Date().toISOString(),
        status: "Read",
      })
      .eq("recipient_email", userEmail)
      .is("read_at", null);

    if (error) {
      alert(error.message);
      return;
    }

    loadNotifications();
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between bg-white rounded-3xl shadow p-5">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-100 px-4 py-2 rounded-xl font-bold"
          >
            ← Back
          </button>

          <div className="text-right">
            <h1 className="text-3xl font-black text-[#061B33]">
              Notifications
            </h1>
            <p className="text-gray-500">
              {unreadCount} unread
            </p>
          </div>
        </div>

        <button
          onClick={markAllRead}
          className="w-full bg-black text-white p-4 rounded-2xl font-bold mt-5"
        >
          Mark All Read
        </button>

        <div className="space-y-4 mt-5">
          {notifications.length === 0 && (
            <div className="bg-white rounded-3xl shadow p-6 text-center text-gray-500">
              No notifications yet.
            </div>
          )}

          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl shadow p-5 border ${
                item.read_at ? "bg-white" : "bg-orange-50 border-orange-300"
              }`}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xl font-black text-[#061B33]">
                    🔔 {item.notification_type || "Notification"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.channel || "In-App"} •{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "Unknown date"}
                  </p>
                </div>

                {!item.read_at && (
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full h-fit font-bold">
                    New
                  </span>
                )}
              </div>

              <p className="text-gray-700 mt-4">
                {item.message || "No message"}
              </p>

              {!item.read_at && (
                <button
                  onClick={() => markRead(item.id)}
                  className="mt-4 bg-[#061B33] text-white px-4 py-2 rounded-xl font-bold"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
