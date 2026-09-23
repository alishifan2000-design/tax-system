"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewTaxPeriodPage() {
  const [taxType, setTaxType] = useState("GST");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("open");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function saveTaxPeriod() {
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
      setMessage(membershipError?.message || "Organization not found.");
      return;
    }

    const { error } = await supabase.from("tax_periods").insert([
      {
        organization_id: membership.organization_id,
        tax_type: taxType,
        period_start: periodStart,
        period_end: periodEnd,
        due_date: dueDate || null,
        status,
        notes: notes || null,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Tax period created successfully.");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <button
          onClick={() => window.history.back()}
          className="mb-4 text-xl text-slate-300 hover:text-white"
        >
          ←
        </button>
        
        <p className="text-sm text-slate-400">TAX SYSTEM</p>

        <h1 className="mt-2 text-3xl font-bold">Create Tax Period</h1>

        <label className="mt-6 block text-sm">Tax Type</label>
        <select
          value={taxType}
          onChange={(e) => setTaxType(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="GST">GST</option>
          <option value="EWT">EWT</option>
          <option value="NWT">NWT</option>
        </select>

        <label className="mt-4 block text-sm">Period Start</label>
        <input
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Period End</label>
        <input
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="open">Open</option>
          <option value="filed">Filed</option>
          <option value="paid">Paid</option>
          <option value="closed">Closed</option>
        </select>

        <label className="mt-4 block text-sm">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          rows={3}
          placeholder="Optional notes"
        />

        <button
          onClick={saveTaxPeriod}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Tax Period
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        )}
      </div>
    </main>
  );
}