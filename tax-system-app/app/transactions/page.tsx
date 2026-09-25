"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatMaldivesDate } from "@/lib/dateTime";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading transactions...");

  useEffect(() => {
    async function loadTransactions() {
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

      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, transaction_type, transaction_date, reference_no, description, category, amount_excl_gst, gst_amount, total_amount, payment_status"
        )
        .eq("organization_id", membership.organization_id)
        .order("transaction_date", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setTransactions(data ?? []);
      setMessage("");
    }

    loadTransactions();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">TAX SYSTEM</p>
            <h1 className="mt-1 text-3xl font-bold">Transactions</h1>
          </div>

          <div className="flex gap-2">
            <a
              href="/transactions/income"
              className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
            >
              Add Income
            </a>

            <a
              href="/transactions/expense"
              className="rounded-xl bg-slate-800 px-4 py-3 font-semibold"
            >
              Add Expense
            </a>
          </div>
        </div>

        {message ? (
          <p className="mt-6 text-slate-300">{message}</p>
        ) : transactions.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-slate-900 p-6">
            <p className="text-slate-300">No transactions found.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-2xl bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">
                      {transaction.transaction_date
                        ? formatMaldivesDate(transaction.transaction_date)
                        : "No date"}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {transaction.description || "No description"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Ref: {transaction.reference_no || "No reference"}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                    {transaction.transaction_type}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <p>
                    Category: {transaction.category || "Not set"}
                  </p>

                  <p>
                    Payment: {transaction.payment_status || "Not set"}
                  </p>

                  <p>
                    Amount Excl. GST: MVR{" "}
                    {Number(transaction.amount_excl_gst || 0).toFixed(2)}
                  </p>

                  <p>
                    GST: MVR{" "}
                    {Number(transaction.gst_amount || 0).toFixed(2)}
                  </p>

                  <p className="font-semibold text-white">
                    Total: MVR{" "}
                    {Number(transaction.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}