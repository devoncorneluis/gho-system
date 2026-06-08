export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#061B33] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-10 text-center">
        <h1 className="text-5xl font-bold text-[#061B33]">GHO</h1>
        <p className="mt-3 text-orange-500 text-xl font-semibold">
          Global Handling Operations
        </p>
        <p className="mt-8 text-2xl font-medium text-gray-700">
          Smarter Staff Transport. Safer Employees.
        </p>
        <a
          href="/login"
          className="mt-10 inline-block rounded-full bg-orange-500 px-7 py-3 text-white font-semibold transition hover:bg-orange-600"
        >
          Go to Login
        </a>
      </div>
    </main>
  );
}
