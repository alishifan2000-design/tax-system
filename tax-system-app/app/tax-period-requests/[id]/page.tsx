"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReviewTaxPeriodRequestPage() {
    const params = useParams();
    const id = params.id as string;

    const [request, setRequest] = useState<any>(null);
    const [message, setMessage] = useState("Loading request...");

    useEffect(() => {
        async function loadRequest() {
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
                setMessage("Organization membership not found.");
                return;
            }

            if (
                !["admin", "senior"].includes(
                    String(membership.role ?? "").trim().toLowerCase()
                )
            ) {
                setMessage("You do not have permission to review this request.");
                return;
            }

            const { data, error } = await supabase
                .from("tax_period_change_requests")
                .select(`
          id,
          organization_id,
          tax_period_id,
          requested_changes,
          reason,
          status,
          requested_by,
          created_at,
          tax_periods (
            tax_type,
            period_start,
            period_end,
            due_date,
            status,
            payment_reference,
            notes
          )
        `)
                .eq("id", id)
                .eq("organization_id", membership.organization_id)
                .single();

            if (error) {
                setMessage(error.message);
                return;
            }

            setRequest(data);
            setMessage("");
        }

        if (id) {
            loadRequest();
        }
    }, [id]);

    if (message) {
        return (
            <main className="min-h-screen bg-slate-950 p-6 text-white">
                <p>{message}</p>
            </main>
        );
    }

    if (!request) {
        return null;
    }

    async function approveRequest() {
        setMessage("Approving...");

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setMessage("You are not signed in.");
            return;
        }

        const changes = request.requested_changes ?? {};

        const { error: taxPeriodError } = await supabase
            .from("tax_periods")
            .update({
                due_date: changes.due_date ?? request.tax_periods?.due_date,
                status: changes.status ?? request.tax_periods?.status,
                payment_reference:
                    changes.payment_reference ?? request.tax_periods?.payment_reference,
                notes: changes.notes ?? request.tax_periods?.notes,
            })
            .eq("id", request.tax_period_id);

        if (taxPeriodError) {
            setMessage(taxPeriodError.message);
            return;
        }

        const { error: requestError } = await supabase
            .from("tax_period_change_requests")
            .update({
                status: "approved",
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
            })
            .eq("id", request.id);

        if (requestError) {
            setMessage(requestError.message);
            return;
        }

        setRequest({
            ...request,
            status: "approved",
        });

        setMessage("Change request approved.");
    }

    async function rejectRequest() {
        setMessage("Rejecting...");

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setMessage("You are not signed in.");
            return;
        }

        const { error } = await supabase
            .from("tax_period_change_requests")
            .update({
                status: "rejected",
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
            })
            .eq("id", request.id);

        if (error) {
            setMessage(error.message);
            return;
        }

        setRequest({
            ...request,
            status: "rejected",
        });

        setMessage("Change request rejected.");
    }

    return (
        <main className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900 p-8">
                <button
                    onClick={() => window.history.back()}
                    className="mb-4 text-xl text-slate-300 hover:text-white"
                >
                    ←
                </button>
                
                <p className="text-sm text-slate-400">TAX SYSTEM</p>

                <h1 className="mt-2 text-3xl font-bold">
                    Review Tax Period Change Request
                </h1>

                <div className="mt-6 space-y-3 text-sm">
                    <p>
                        <span className="text-slate-400">Tax Type:</span>{" "}
                        {request.tax_periods?.tax_type}
                    </p>

                    <p>
                        <span className="text-slate-400">Period:</span>{" "}
                        {request.tax_periods?.period_start} to{" "}
                        {request.tax_periods?.period_end}
                    </p>

                    <p>
                        <span className="text-slate-400">Reason:</span>{" "}
                        {request.reason}
                    </p>

                    <p className="text-slate-400">Requested Changes</p>

                    <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-300">
                        {JSON.stringify(request.requested_changes, null, 2)}
                    </pre>

                    <p className="text-xs text-slate-500">
                        Submitted: {request.created_at}
                    </p>
                </div>

                {request.status === "pending" && (
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={approveRequest}
                            className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white"
                        >
                            Approve
                        </button>

                        <button
                            onClick={rejectRequest}
                            className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white"
                        >
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}