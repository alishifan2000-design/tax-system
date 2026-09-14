import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .limit(5);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">Maldives Tax Management</p>

        <h1 className="mt-2 text-4xl font-bold">TAX SYSTEM</h1>

        {error ? (
          <div className="mt-6 rounded-2xl bg-red-950 p-4">
            <p className="font-semibold">Supabase connection error</p>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-green-950 p-4">
            <p className="font-semibold">Supabase connected successfully</p>
            <p className="mt-2 text-sm">
              Organizations found: {data?.length ?? 0}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}