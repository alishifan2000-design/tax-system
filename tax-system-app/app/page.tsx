"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("Loading dashboard...");

  useEffect(() => {
    async function loadDashboard() {
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

      if (membershipError) {
        setMessage(membershipError.message);
        return;
      }

      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("display_name")
        .eq("id", membership.organization_id)
        .single();

      if (organizationError) {
        setMessage(organizationError.message);
        return;
      }

      setOrganizationName(organization.display_name);
      setRole(membership.role);
      setMessage("");
    }

    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Maldives Tax Management
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              TAX SYSTEM
            </h1>

            {!message && (
              <p className="mt-2 text-slate-300">
                {organizationName} · {role}
              </p>
            )}
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl bg-slate-900 p-5">
            <p className="text-slate-300">{message}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-bold">
                  MVR 0.00
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Expenses
                </p>
                <p className="mt-2 text-2xl font-bold">
                  MVR 0.00
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  GST Payable
                </p>
                <p className="mt-2 text-2xl font-bold">
                  MVR 0.00
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Active Projects
                </p>
                <p className="mt-2 text-2xl font-bold">
                  0
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-900 p-5">
                <h2 className="text-lg font-semibold">
                  Quick Actions
                </h2>

                <div className="mt-4 grid gap-3">
                  <button className="rounded-xl bg-white p-3 font-semibold text-slate-950">
                    Add Income
                  </button>

                  <button className="rounded-xl bg-slate-800 p-3 font-semibold">
                    Add Expense
                  </button>

                  <button className="rounded-xl bg-slate-800 p-3 font-semibold">
                    Add Project
                  </button>

                  <button className="rounded-xl bg-slate-800 p-3 font-semibold">
                    Upload Receipt
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <h2 className="text-lg font-semibold">
                  Tax Status
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST</span>
                    <span>Not calculated</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">EWT</span>
                    <span>Not calculated</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">NWT</span>
                    <span>Not calculated</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Period</span>
                    <span>Not set</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}