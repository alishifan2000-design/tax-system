"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("Loading dashboard...");
  const [activeProjects, setActiveProjects] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [gstPayable, setGstPayable] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState("Not set");
  const [gstStatus, setGstStatus] = useState("Not calculated");

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

      const { count: projectCount, error: projectError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", membership.organization_id)
        .eq("status", "active");

      if (projectError) {
        setMessage(projectError.message);
        return;
      }

      setActiveProjects(projectCount ?? 0);

      const { data: incomeTransactions, error: incomeError } = await supabase
        .from("transactions")
        .select("total_amount")
        .eq("organization_id", membership.organization_id)
        .eq("transaction_type", "income");

      if (incomeError) {
        setMessage(incomeError.message);
        return;
      }

      const totalRevenue =
        incomeTransactions?.reduce(
          (sum, transaction) => sum + Number(transaction.total_amount || 0),
          0
        ) ?? 0;

      setRevenue(totalRevenue);

      const { data: expenseTransactions, error: expenseError } = await supabase
        .from("transactions")
        .select("total_amount")
        .eq("organization_id", membership.organization_id)
        .eq("transaction_type", "expense");

      if (expenseError) {
        setMessage(expenseError.message);
        return;
      }

      const totalExpenses =
        expenseTransactions?.reduce(
          (sum, transaction) => sum + Number(transaction.total_amount || 0),
          0
        ) ?? 0;

      setExpenses(totalExpenses);

      const { data: gstTransactions, error: gstError } = await supabase
        .from("transactions")
        .select("transaction_type, gst_amount")
        .eq("organization_id", membership.organization_id);

      if (gstError) {
        setMessage(gstError.message);
        return;
      }

      const outputGst =
        gstTransactions
          ?.filter((transaction) => transaction.transaction_type === "income")
          .reduce(
            (sum, transaction) => sum + Number(transaction.gst_amount || 0),
            0
          ) ?? 0;

      const inputGst =
        gstTransactions
          ?.filter((transaction) => transaction.transaction_type === "expense")
          .reduce(
            (sum, transaction) => sum + Number(transaction.gst_amount || 0),
            0
          ) ?? 0;

      const netGst = outputGst - inputGst;

      setGstPayable(netGst);

      if (netGst > 0) {
        setGstStatus(`Payable: MVR ${netGst.toFixed(2)}`);
      } else if (netGst < 0) {
        setGstStatus(`Credit: MVR ${Math.abs(netGst).toFixed(2)}`);
      } else {
        setGstStatus("No GST payable");
      }

      const { data: taxPeriod, error: taxPeriodError } = await supabase
        .from("tax_periods")
        .select("tax_type, period_start, period_end, status")
        .eq("organization_id", membership.organization_id)
        .eq("status", "open")
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (taxPeriodError) {
        setMessage(taxPeriodError.message);
        return;
      }

      if (taxPeriod) {
        setCurrentPeriod(
          `${taxPeriod.tax_type}: ${taxPeriod.period_start} to ${taxPeriod.period_end}`
        );
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
            {message === "You are not signed in." ? (
              <div>
                <p className="text-slate-300">You are not signed in.</p>

                <a
                  href="/login"
                  className="mt-4 inline-block rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
                >
                  Sign In
                </a>
              </div>
            ) : (
              <p className="text-slate-300">{message}</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-bold">
                  MVR {revenue.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Expenses
                </p>
                <p className="mt-2 text-2xl font-bold">
                  MVR {expenses.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  GST Payable
                </p>
                <p className="mt-2 text-2xl font-bold">
                  MVR {gstPayable.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Active Projects
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {activeProjects}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-900 p-5">
                <h2 className="text-lg font-semibold">
                  Quick Actions
                </h2>

                <div className="mt-4 grid gap-3">
                  <a
                    href="/transactions/income"
                    className="rounded-xl bg-white p-3 text-center font-semibold text-slate-950"
                  >
                    Add Income
                  </a>

                  <a
                    href="/transactions/expense"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    Add Expense
                  </a>

                  <a
                    href="/transactions"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    View Transactions
                  </a>

                  <a
                    href="/projects/new"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    Add Project
                  </a>

                  <a
                    href="/projects"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    View Projects
                  </a>

                  <a
                    href="/customers/new"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    Add Customer
                  </a>

                  <a
                    href="/customers"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    View Customers
                  </a>

                  <a
                    href="/suppliers/new"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    Add Supplier
                  </a>

                  <a
                    href="/suppliers"
                    className="rounded-xl bg-slate-800 p-3 text-center font-semibold"
                  >
                    View Suppliers
                  </a>

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
                    <span>{gstStatus}</span>
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
                    <span>{currentPeriod}</span>
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