"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyTaxPeriodRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading requests...");
  const [reviewerNames, setReviewerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadRequests() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You are not signed in.");
        return;
      }

      const { data, error } = await supabase
        .from("tax_period_change_requests")
        .select(`
          id,
          requested_changes,
          reason,
          status,
          reviewed_by,
          reviewed_at,
          created_at,
          tax_periods (
            tax_type,
            period_start,
            period_end
          )
        `)
        .eq("requested_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setRequests(data ?? []);

      const reviewerIds = (data ?? [])
        .map((request) => request.reviewed_by)
        .filter(Boolean);

      if (reviewerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", reviewerIds);

        const names: Record<string, string> = {};

        profiles?.forEach((profile) => {
          names[profile.id] = profile.full_name;
        });

        setReviewerNames(names);
      }

      setMessage("");
    }

    loadRequests();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm text-slate-400">TAX SYSTEM</p>
          <h1 className="mt-2 text-3xl font-bold">My Change Requests</h1>
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
                    {request.tax_periods?.period_start} to{" "}
                    {request.tax_periods?.period_end}
                  </h2>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${request.status === "approved"
                    ? "bg-emerald-900/40 text-emerald-300"
                    : request.status === "rejected"
                      ? "bg-red-900/40 text-red-300"
                      : "bg-amber-900/40 text-amber-300"
                    }`}
                >
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
                    Submitted:
                  </span>{" "}
                  {request.created_at}
                </p>

                <p>
                  <span className="text-slate-400">
                    Reviewed:
                  </span>{" "}
                  {request.reviewed_at ?? "Not reviewed yet"}
                </p>
                <p>
                  <span className="text-slate-400">
                    Reviewed By:
                  </span>{" "}
                  {request.reviewed_by
                    ? reviewerNames[request.reviewed_by]
                      ? `${reviewerNames[request.reviewed_by]} (${request.reviewed_by.slice(0, 8)})`
                      : request.reviewed_by.slice(0, 8)
                    : "Not reviewed yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}