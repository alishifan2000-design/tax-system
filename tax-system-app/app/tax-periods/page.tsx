"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TaxPeriodsPage() {
    const [periods, setPeriods] = useState<any[]>([]);
    const [message, setMessage] = useState("Loading tax periods...");
    const [role, setRole] = useState("");

    useEffect(() => {
        async function loadTaxPeriods() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setMessage("You are not signed in.");
                return;
            }

            const { data: membership, error: membershipError } = await supabase
                .from("organization_users")
                .select("organization_id, role")
                .eq("user_id", user.id)
                .single();

            if (membershipError || !membership) {
                setMessage(membershipError?.message || "Organization not found.");
                return;
            }

            setRole(membership.role ?? "");

            const { data, error } = await supabase
                .from("tax_periods")
                .select(
                    "id, tax_type, period_start, period_end, due_date, status, filed_at, payment_reference, notes"
                )
                .eq("organization_id", membership.organization_id)
                .order("period_start", { ascending: false });

            if (error) {
                setMessage(error.message);
                return;
            }

            setPeriods(data ?? []);
            setMessage("");
        }

        loadTaxPeriods();
    }, []);

    return (
        <main className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-400">TAX SYSTEM</p>
                        <h1 className="mt-1 text-3xl font-bold">Tax Periods</h1>
                    </div>

                    <a
                        href="/tax-periods/new"
                        className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
                    >
                        Add Tax Period
                    </a>
                </div>

                {message ? (
                    <p className="mt-6 text-slate-300">{message}</p>
                ) : periods.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-900 p-6">
                        <p className="text-slate-300">No tax periods found.</p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {periods.map((period) => (
                            <div
                                key={period.id}
                                className="rounded-2xl bg-slate-900 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400">
                                            {period.tax_type}
                                        </p>

                                        <h2 className="mt-1 text-xl font-semibold">
                                            {period.period_start} to {period.period_end}
                                        </h2>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                                            {period.status}
                                        </span>

                                        {["admin", "senior"].includes(role.toLowerCase()) && (
                                            <a
                                                href={`/tax-periods/${period.id}/edit`}
                                                className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
                                            >
                                                Edit
                                            </a>
                                        )}

                                        {!["admin", "senior"].includes(role.toLowerCase()) && (
                                            <a
                                                href={`/tax-periods/${period.id}/request-change`}
                                                className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
                                            >
                                                Request Change
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-slate-300">
                                    <p>Due Date: {period.due_date || "Not set"}</p>
                                    <p>Filed At: {period.filed_at || "Not filed"}</p>
                                    <p>
                                        Payment Reference:{" "}
                                        {period.payment_reference || "Not set"}
                                    </p>
                                    <p>Notes: {period.notes || "None"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}