"use client";

import { supabase } from "@/lib/supabase";

export default function SignOutButton() {
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
    >
      Sign Out
    </button>
  );
}