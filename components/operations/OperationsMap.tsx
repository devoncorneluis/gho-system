"use client";

import React from "react";

export default function OperationsMap() {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Operations Map</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Geographic dispatch view</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Map ready</span>
      </div>

      <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-slate-50 text-center">
        <div>
          <p className="text-lg font-semibold text-[#061B33]">Map integration placeholder</p>
          <p className="mt-2 text-sm text-gray-500">The live map layer can be connected to the existing mapping stack next.</p>
        </div>
      </div>
    </section>
  );
}
