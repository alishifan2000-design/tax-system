"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading payroll...");

  useEffect(() => {
    async function loadPayroll() {
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
        .from("employee_payroll")
        .select(`
          id,
          period_month,
          basic_salary,
          allowances,
          non_cash_benefits,
          gross_remuneration,
          employee_pension,
          taxable_remuneration,
          ewt_amount,
          payment_status,
          employees (
            employee_no,
            full_name
          )
        `)
        .eq("organization_id", membership.organization_id)
        .order("period_month", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setPayroll(data ?? []);
      setMessage("");
    }

    loadPayroll();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">TAX SYSTEM</p>
            <h1 className="mt-2 text-3xl font-bold">Payroll</h1>
          </div>

          <Link
            href="/payroll/new"
            className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Add Payroll
          </Link>
        </div>

        {message && (
          <p className="mb-4 text-sm text-slate-300">{message}</p>
        )}

        <div className="overflow-x-auto rounded-2xl bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Month</th>
                <th className="p-4">Gross</th>
                <th className="p-4">Pension</th>
                <th className="p-4">Taxable</th>
                <th className="p-4">EWT</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {payroll.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-800 last:border-0"
                >
                  <td className="p-4">
                    {row.employees?.employee_no
                      ? `${row.employees.employee_no} - ${row.employees.full_name}`
                      : row.employees?.full_name ?? "Unknown employee"}
                  </td>

                  <td className="p-4">{row.period_month}</td>

                  <td className="p-4">
                    MVR {Number(row.gross_remuneration || 0).toFixed(2)}
                  </td>

                  <td className="p-4">
                    MVR {Number(row.employee_pension || 0).toFixed(2)}
                  </td>

                  <td className="p-4">
                    MVR {Number(row.taxable_remuneration || 0).toFixed(2)}
                  </td>

                  <td className="p-4">
                    MVR {Number(row.ewt_amount || 0).toFixed(2)}
                  </td>

                  <td className="p-4 capitalize">
                    {row.payment_status}
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