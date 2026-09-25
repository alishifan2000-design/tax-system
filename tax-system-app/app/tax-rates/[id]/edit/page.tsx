"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditTaxRatePage() {
  const params = useParams();
  const id = params.id as string;

  const [taxType, setTaxType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [rate, setRate] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadTaxRate() {
      const { data, error } = await supabase
        .from("tax_rates")
        .select(
          "tax_type, payment_type, rate, effective_from, effective_to"
        )
        .eq("id", id)
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      setTaxType(data.tax_type ?? "");
      setPaymentType(data.payment_type ?? "");
      setRate(String(data.rate ?? ""));
      setEffectiveFrom(data.effective_from ?? "");
      setEffectiveTo(data.effective_to ?? "");
      setMessage("");
    }

    if (id) {
      loadTaxRate();
    }
  }, [id]);

  async function updateTaxRate() {
    setMessage("Saving...");

    const { data, error } = await supabase
      .from("tax_rates")
      .update({
        tax_type: taxType,
        payment_type: paymentType,
        rate: Number(rate),
        effective_from: effectiveFrom,
        effective_to: effectiveTo || null,
      })
      .eq("id", id)
      .select("id");

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("You do not have permission to update tax rates.");
      return;
    }

    setMessage("Tax rate updated successfully.");
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

        <h1 className="mt-2 text-3xl font-bold">
          Edit Tax Rate
        </h1>

        <label className="mt-6 block text-sm">Tax Type</label>

        <input
          value={taxType}
          onChange={(e) => setTaxType(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Payment Type</label>

        <input
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
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
          onClick={updateTaxRate}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Changes
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