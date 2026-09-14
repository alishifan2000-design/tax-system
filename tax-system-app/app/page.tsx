export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl">
        <p className="text-sm text-slate-400">Maldives Tax Management</p>

        <h1 className="mt-2 text-4xl font-bold">
          TAX SYSTEM
        </h1>

        <p className="mt-4 text-slate-300">
          Your web-based tax dashboard is now running.
        </p>

        <button className="mt-8 w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
          Continue
        </button>
      </div>
    </main>
  );
}