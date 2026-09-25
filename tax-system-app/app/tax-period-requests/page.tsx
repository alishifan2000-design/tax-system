"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatMaldivesDate, formatMaldivesDateTime } from "@/lib/dateTime";

export default function TaxPeriodRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading requests...");

  useEffect(() => {
    async function loadRequests() {
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
        setMessage("You do not have permission to review change requests.");
        return;
      }

      const { data, error } = await supabase
        .from("tax_period_change_requests")
        .select(`
          id,
          tax_period_id,
          requested_changes,
          reason,
          status,
          requested_by,
          reviewed_at,
          created_at,
          tax_periods (
            tax_type,
            period_start,
            period_end
          )
        `)
        .eq("organization_id", membership.organization_id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setRequests(data ?? []);
      setMessage("");
    }

    loadRequests();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm text-slate-400">TAX SYSTEM</p>
          <h1 className="mt-2 text-3xl font-bold">
            Tax Period Change Requests
          </h1>
        </div>

        {message && (
          <p className="mb-4 text-sm text-slate-300">
            {message}
          </p>
        )}

        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl bg-slate-900 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">
                    {request.tax_periods?.tax_type ?? "Tax Period"}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    {formatMaldivesDate(request.tax_periods?.period_start)} to{" "}
                    {formatMaldivesDate(request.tax_periods?.period_end)}
                  </h2>
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize">
                  {request.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-slate-400">Reason:</span>{" "}
                  {request.reason}
                </p>

                <p>
                  <span className="text-slate-400">
                    Requested Changes:
                  </span>
                </p>

                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
                  {JSON.stringify(
                    request.requested_changes,
                    null,
                    2
                  )}
                </pre>

                <p className="text-xs text-slate-500">
                  Submitted: {formatMaldivesDateTime(request.created_at)}
                </p>

                {request.reviewed_at && (
                  <p className="text-xs text-slate-500">
                    Reviewed: {formatMaldivesDateTime(request.reviewed_at)}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <a
                  href={`/tax-period-requests/${request.id}`}
                  className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  {request.status === "pending" ? "Review Request" : "View Request"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}