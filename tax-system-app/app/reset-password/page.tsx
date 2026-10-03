"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function updatePassword() {
    setMessage("Updating password...");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully.");
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full rounded border p-3 text-black"
      />

      <button
        onClick={updatePassword}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Update Password
      </button>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}