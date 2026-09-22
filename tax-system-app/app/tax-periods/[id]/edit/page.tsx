"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditTaxPeriodPage() {
    const params = useParams();
    const id = params.id as string;

    const [taxType, setTaxType] = useState("");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("open");
    const [filedAt, setFiledAt] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("Loading...");
    const [role, setRole] = useState("");

    useEffect(() => {
        async function loadTaxPeriod() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setMessage("You are not signed in.");
                return;
            }

            const { data: membership, error: membershipError } = await supabase
                .from("organization_users")
                .select("role")
                .eq("user_id", user.id)
                .single();

            if (membershipError || !membership) {
                setMessage("Organization membership not found.");
                return;
            }

            if (
                !["admin", "senior"].includes(
                    String(membership.role ?? "").trim().toLowerCase()
                )
            ) {
                setMessage(
                    `You do not have permission to edit tax periods. Role detected: "${String(
                        membership.role ?? ""
                    )}"`
                );
                return;
            }

            setRole(membership.role ?? "");

            const { data, error } = await supabase
                .from("tax_periods")
                .select(
                    "tax_type, period_start, period_end, due_date, status, filed_at, payment_reference, notes"
                )
                .eq("id", id)
                .single();

            if (error || !data) {
                setMessage(error.message);
                return;
            }

            setTaxType(data.tax_type ?? "");
            setPeriodStart(data.period_start ?? "");
            setPeriodEnd(data.period_end ?? "");
            setDueDate(data.due_date ?? "");
            setStatus(data.status ?? "open");
            setFiledAt(data.filed_at ? data.filed_at.slice(0, 16) : "");
            setPaymentReference(data.payment_reference ?? "");
            setNotes(data.notes ?? "");
            setMessage("");
        }

        if (id) {
            loadTaxPeriod();
        }
    }, [id]);

    async function updateTaxPeriod() {
        setMessage("Saving...");

        const { error } = await supabase
            .from("tax_periods")
            .update({
                due_date: dueDate || null,
                status,
                filed_at: filedAt || null,
                payment_reference: paymentReference || null,
                notes: notes || null,
            })
            .eq("id", id);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("Tax period updated successfully.");
    }

    return (
        <main className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
                <p className="text-sm text-slate-400">TAX SYSTEM</p>

                <h1 className="mt-2 text-3xl font-bold">
                    Edit Tax Period
                </h1>

                <label className="mt-6 block text-sm">Tax Type</label>

                <input
                    value={taxType}
                    readOnly
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-slate-400"
                />

                <label className="mt-4 block text-sm">Period Start</label>

                <input
                    type="date"
                    value={periodStart}
                    readOnly
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-slate-400"
                />

                <label className="mt-4 block text-sm">Period End</label>

                <input
                    type="date"
                    value={periodEnd}
                    readOnly
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-slate-400"
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

                <label className="mt-4 block text-sm">Filed At</label>

                <input
                    type="datetime-local"
                    value={filedAt}
                    onChange={(e) => setFiledAt(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">Payment Reference</label>

                <input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">Notes</label>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                    rows={4}
                />

                <button
                    onClick={updateTaxPeriod}
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