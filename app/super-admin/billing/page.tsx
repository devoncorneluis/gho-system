Control + C
cat > app/super-admin/billing/page.tsx <<'EOF'
"use client";

export default function SuperAdminBillingPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Billing Dashboard
      </h1>
      <p className="mt-4">Billing page is working.</p>
    </main>
  );
}
