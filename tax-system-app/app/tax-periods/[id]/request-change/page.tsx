"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RequestTaxPeriodChangePage() {
    const params = useParams();
    const id = params.id as string;

    const [taxType, setTaxType] = useState("");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [notes, setNotes] = useState("");

    const [requestedDueDate, setRequestedDueDate] = useState("");
    const [requestedStatus, setRequestedStatus] = useState("");
    const [requestedPaymentReference, setRequestedPaymentReference] =
        useState("");
    const [requestedNotes, setRequestedNotes] = useState("");
    const [reason, setReason] = useState("");
    const [message, setMessage] = useState("Loading...");

    useEffect(() => {
        async function loadTaxPeriod() {
            const { data, error } = await supabase
                .from("tax_periods")
                .select(
                    "tax_type, period_start, period_end, due_date, status, payment_reference, notes"
                )
                .eq("id", id)
                .single();

            if (error) {
                setMessage(error.message);
                return;
            }

            setTaxType(data.tax_type ?? "");
            setPeriodStart(data.period_start ?? "");
            setPeriodEnd(data.period_end ?? "");
            setDueDate(data.due_date ?? "");
            setStatus(data.status ?? "");
            setPaymentReference(data.payment_reference ?? "");
            setNotes(data.notes ?? "");

            setRequestedDueDate(data.due_date ?? "");
            setRequestedStatus(data.status ?? "");
            setRequestedPaymentReference(data.payment_reference ?? "");
            setRequestedNotes(data.notes ?? "");

            setMessage("");
        }

        if (id) {
            loadTaxPeriod();
        }
    }, [id]);

    async function submitRequest() {
        setMessage("Submitting...");

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

        if (!reason.trim()) {
            setMessage("Please explain why this change is needed.");
            return;
        }

        const requestedChanges = {
            due_date: requestedDueDate || null,
            status: requestedStatus || null,
            payment_reference: requestedPaymentReference || null,
            notes: requestedNotes || null,
        };

        const { error } = await supabase
            .from("tax_period_change_requests")
            .insert([
                {
                    organization_id: membership.organization_id,
                    tax_period_id: id,
                    requested_by: user.id,
                    requested_changes: requestedChanges,
                    reason: reason.trim(),
                    status: "pending",
                },
            ]);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("Change request submitted successfully.");
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
                    Request Tax Period Change
                </h1>

                <label className="mt-6 block text-sm">Tax Type</label>
                <input
                    value={taxType}
                    readOnly
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-slate-400"
                />

                <label className="mt-4 block text-sm">Period</label>
                <input
                    value={`${periodStart} to ${periodEnd}`}
                    readOnly
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-slate-400"
                />

                <label className="mt-4 block text-sm">Requested Due Date</label>
                <input
                    type="date"
                    value={requestedDueDate}
                    onChange={(e) => setRequestedDueDate(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">Requested Status</label>
                <select
                    value={requestedStatus}
                    onChange={(e) => setRequestedStatus(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                >
                    <option value="open">Open</option>
                    <option value="filed">Filed</option>
                    <option value="paid">Paid</option>
                    <option value="closed">Closed</option>
                </select>

                <label className="mt-4 block text-sm">
                    Requested Payment Reference
                </label>
                <input
                    value={requestedPaymentReference}
                    onChange={(e) =>
                        setRequestedPaymentReference(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">Requested Notes</label>
                <textarea
                    value={requestedNotes}
                    onChange={(e) => setRequestedNotes(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                    rows={4}
                />

                <label className="mt-4 block text-sm">
                    Reason for Change
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                    rows={4}
                    placeholder="Explain why this change is needed"
                />

                <button
                    onClick={submitRequest}
                    className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
                >
                    Submit Change Request
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