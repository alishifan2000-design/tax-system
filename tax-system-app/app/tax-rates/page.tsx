"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TaxRatesPage() {
    const [rates, setRates] = useState<any[]>([]);
    const [message, setMessage] = useState("Loading tax rates...");

    useEffect(() => {
        async function loadRates() {
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

            const { data, error } = await supabase
                .from("tax_rates")
                .select(
                    "id, tax_type, payment_type, rate, effective_from, effective_to"
                )
                .eq("organization_id", membership.organization_id)
                .order("tax_type")
                .order("payment_type")
                .order("effective_from", { ascending: false });

            if (error) {
                setMessage(error.message);
                return;
            }

            setRates(data ?? []);
            setMessage("");
        }

        loadRates();
    }, []);

    return (
        <main className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">TAX SYSTEM</p>
                        <h1 className="mt-2 text-3xl font-bold">Tax Rates</h1>
                    </div>

                    <a
                        href="/tax-rates/new"
                        className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
                    >
                        Add Tax Rate
                    </a>
                </div>
                {message && (
                    <p className="mb-4 text-sm text-slate-300">
                        {message}
                    </p>
                )}

                <div className="overflow-x-auto rounded-2xl bg-slate-900">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-800 text-slate-400">
                            <tr>
                                <th className="p-4">Tax Type</th>
                                <th className="p-4">Payment Type</th>
                                <th className="p-4">Rate</th>
                                <th className="p-4">Effective From</th>
                                <th className="p-4">Effective To</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rates.map((rate) => (
                                <tr
                                    key={rate.id}
                                    className="border-b border-slate-800 last:border-0"
                                >
                                    <td className="p-4">
                                        {rate.tax_type}
                                    </td>

                                    <td className="p-4">
                                        {rate.payment_type
                                            .replaceAll("_", " ")
                                            .replace(/\b\w/g, (char: string) => char.toUpperCase())}
                                    </td>

                                    <td className="p-4">
                                        {Number(rate.rate || 0).toFixed(2)}%
                                    </td>

                                    <td className="p-4">
                                        {rate.effective_from}
                                    </td>

                                    <td className="p-4">
                                        {rate.effective_to ?? "Current"}
                                    </td>

                                    <td className="p-4">
                                      <a
                                        href={`/tax-rates/${rate.id}/edit`}
                                        className="text-blue-400 hover:underline"
                                      >
                                        Edit
                                      </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}