"use client";

import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, subtitle, actions, children, className }: CardProps) {
  return (
    <section className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-sm ${className || ""}`}>
      {(title || subtitle || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-lg font-black text-[#061B33]">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
