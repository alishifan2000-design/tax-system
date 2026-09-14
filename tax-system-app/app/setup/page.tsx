"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("sole_proprietorship");
  const [message, setMessage] = useState("");

  async function saveOrganization() {
    setMessage("Saving...");

    const { error } = await supabase.from("organizations").insert([
      {
        legal_name: name,      
        display_name: name,
        entity_type: type,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Organization created successfully.");
    setName("");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">TAX SYSTEM Setup</p>

        <h1 className="mt-2 text-3xl font-bold">
          Create Organization
        </h1>

        <label className="mt-6 block text-sm">
          Organization Name
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Enter business name"
        />

        <label className="mt-4 block text-sm">
          Organization Type
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="sole_proprietorship">
            Sole Proprietorship
          </option>
          <option value="company">
            Company
          </option>
        </select>

        <button
          onClick={saveOrganization}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Organization
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