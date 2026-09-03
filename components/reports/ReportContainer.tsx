"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function ReportContainer({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="rounded-2xl bg-white shadow">

      <div className="border-b p-6">

        <h2 className="text-2xl font-black text-[#061B33]">
          {title}
        </h2>

        <p className="mt-2 text-gray-500">
          {subtitle}
        </p>

      </div>

      <div className="p-6">
        {children}
      </div>

    </div>
  );
}