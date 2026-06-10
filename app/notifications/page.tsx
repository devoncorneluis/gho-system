"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string | null;
  status: string | null;
  created_at: string | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function loadNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications(data || []);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Notifications</h1>

      <p className="text-gray-600 mt-2">
        View system alerts and transport updates.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        {notifications.length === 0 && (
          <p className="text-gray-500">No notifications yet.</p>
        )}

        {notifications.map((notification) => (
          <div key={notification.id} className="border-b py-4">
            <p className="font-bold">{notification.title}</p>
            <p className="text-gray-600">{notification.message}</p>
            <p className="text-sm text-gray-500">
              {notification.type} • {notification.status} • {notification.created_at}
            </p>
          </div>
        ))}
      </div>
      </main>
    </AdminLayout>
  );
}
