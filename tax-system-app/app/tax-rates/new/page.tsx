"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewTaxRatePage() {
  const [taxType, setTaxType] = useState("NWT");
  const [paymentType, setPaymentType] = useState("");
  const [rate, setRate] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [message, setMessage] = useState("");

  async function saveTaxRate() {
    setMessage("Saving...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You are not signed in.");
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      setMessage("Organization not found.");
      return;
    }

    if (!paymentType || !rate || !effectiveFrom) {
      setMessage("Please complete all required fields.");
      return;
    }

    const { error } = await supabase.from("tax_rates").insert([
      {
        organization_id: membership.organization_id,
        tax_type: taxType,
        payment_type: paymentType,
        rate: Number(rate),
        effective_from: effectiveFrom,
        effective_to: effectiveTo || null,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Tax rate created successfully.");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">TAX SYSTEM</p>

        <h1 className="mt-2 text-3xl font-bold">Add Tax Rate</h1>

        <label className="mt-6 block text-sm">Tax Type</label>

        <select
          value={taxType}
          onChange={(e) => setTaxType(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="NWT">NWT</option>
          <option value="GST">GST</option>
          <option value="EWT">EWT</option>
        </select>

        <label className="mt-4 block text-sm">Payment Type</label>

        <input
          type="text"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="e.g. contractor"
        />

        <label className="mt-4 block text-sm">Rate (%)</label>

        <input
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Effective From</label>

        <input
          type="date"
          value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Effective To</label>

        <input
          type="date"
          value={effectiveTo}
          onChange={(e) => setEffectiveTo(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <button
          onClick={saveTaxRate}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Tax Rate
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        )}
      </div>
    </main>
  );
}