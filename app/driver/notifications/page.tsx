"use client";
import { subscribeNotifications } from "../../../lib/realtime/subscribeNotifications";
import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { supabase } from "../../../lib/supabase";
import { getUserPlatform } from "../../../lib/getUserPlatform";

type Notification = {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
};

export default function DriverNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("platform_id", userPlatform.platformId)
      .order("created_at", {
        ascending: false,
      });

    setNotifications(data ?? []);
    setLoading(false);
  }

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadNotifications();

  const unsubscribe = subscribeNotifications(() => {
    loadNotifications();
  });

  return () => {
    unsubscribe();
  };
}, []);

  async function markAsRead(id: string) {
    await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id);

    loadNotifications();
  }

  const unread = notifications.filter(
    (n) => !n.is_read
  ).length;

  const read = notifications.filter(
    (n) => n.is_read
  ).length;

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="mb-8">

          <p className="text-sm font-bold uppercase text-orange-500">
            Driver
          </p>

          <h1 className="text-4xl font-black text-[#061B33]">
            Notification Centre
          </h1>

          <p className="mt-2 text-gray-600">
            View all transport notifications.
          </p>

        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-sm text-gray-500">
              Unread
            </p>

            <p className="mt-3 text-5xl font-black text-red-600">
              {unread}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-sm text-gray-500">
              Read
            </p>

            <p className="mt-3 text-5xl font-black text-green-600">
              {read}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-3 text-5xl font-black text-[#061B33]">
              {notifications.length}
            </p>

          </div>

        </div>

        <div className="rounded-2xl bg-white shadow">

          {loading ? (

            <div className="p-10 text-center">
              Loading...
            </div>

          ) : notifications.length === 0 ? (

            <div className="p-10 text-center text-gray-500">
              No notifications found.
            </div>

          ) : (

            notifications.map((notification) => (

              <div
                key={notification.id}
                className="border-b p-6 last:border-b-0"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-[#061B33]">
                      {notification.title}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div className="text-right">

                    {notification.is_read ? (

                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        Read
                      </span>

                    ) : (

                      <>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                          Unread
                        </span>

                        <button
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="mt-3 block rounded-lg bg-[#061B33] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Mark as Read
                        </button>
                      </>

                    )}

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </main>
    </AdminLayout>
  );
}