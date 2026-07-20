"use client";

import type { ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#061B33]">{title}</h3>
          <button onClick={onClose} className="rounded-md border px-3 py-1 text-sm font-semibold">
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
