"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    setMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created. Check your email if confirmation is required.");
  }

  async function signIn() {
    setMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Signed in successfully.");
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">TAX SYSTEM</p>

        <h1 className="mt-2 text-3xl font-bold">
          Sign in
        </h1>

        <label className="mt-6 block text-sm">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="you@example.com"
        />

        <label className="mt-4 block text-sm">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Enter password"
        />

        <button
          onClick={signIn}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Sign In
        </button>

        <button
          onClick={signUp}
          className="mt-3 w-full rounded-xl border border-slate-700 p-3 font-semibold"
        >
          Create Account
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}