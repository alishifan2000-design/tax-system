"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function calculateEwt(taxableRemuneration: number) {
    if (taxableRemuneration <= 60000) {
        return 0;
    }

    let tax = 0;

    if (taxableRemuneration > 60000) {
        tax += Math.min(taxableRemuneration - 60000, 40000) * 0.055;
    }

    if (taxableRemuneration > 100000) {
        tax += Math.min(taxableRemuneration - 100000, 50000) * 0.08;
    }

    if (taxableRemuneration > 150000) {
        tax += Math.min(taxableRemuneration - 150000, 50000) * 0.12;
    }

    if (taxableRemuneration > 200000) {
        tax += (taxableRemuneration - 200000) * 0.15;
    }

    return tax;
}

export default function NewPayrollPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [employeeId, setEmployeeId] = useState("");
    const [periodMonth, setPeriodMonth] = useState("");
    const [basicSalary, setBasicSalary] = useState("");
    const [allowances, setAllowances] = useState("");
    const [nonCashBenefits, setNonCashBenefits] = useState("");
    const [employeePension, setEmployeePension] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("unpaid");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadEmployees() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data: membership } = await supabase
                .from("organization_users")
                .select("organization_id")
                .eq("user_id", user.id)
                .single();

            if (!membership) return;

            const { data } = await supabase
                .from("employees")
                .select("id, employee_no, full_name")
                .eq("organization_id", membership.organization_id)
                .eq("active", true)
                .order("full_name");

            setEmployees(data ?? []);
        }

        loadEmployees();
    }, []);

    async function savePayroll() {
        setMessage("Saving...");

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

        const basic = Number(basicSalary || 0);
        const allowanceAmount = Number(allowances || 0);
        const benefits = Number(nonCashBenefits || 0);
        const pension = Number(employeePension || 0);

        const grossRemuneration =
            basic + allowanceAmount + benefits;

        const taxableRemuneration =
            grossRemuneration - pension;

        const ewtAmount = calculateEwt(taxableRemuneration);

        const { error } = await supabase.from("employee_payroll").insert([
            {
                organization_id: membership.organization_id,
                employee_id: employeeId,
                period_month: periodMonth,
                basic_salary: basic,
                allowances: allowanceAmount,
                non_cash_benefits: benefits,
                gross_remuneration: grossRemuneration,
                employee_pension: pension,
                taxable_remuneration: taxableRemuneration,
                ewt_amount: ewtAmount,
                payment_status: paymentStatus,
            },
        ]);

        if (error) {
            if (error.message.includes("employee_payroll_employee_month_unique")) {
                setMessage("Payroll already exists for this employee and month.");
            } else {
                setMessage(error.message);
            }

            return;
        }

        setMessage("Payroll created successfully.");
    }

    return (
        <main className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
                <p className="text-sm text-slate-400">TAX SYSTEM</p>

                <h1 className="mt-2 text-3xl font-bold">
                    Add Payroll
                </h1>

                <label className="mt-6 block text-sm">
                    Employee
                </label>

                <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                >
                    <option value="">Select employee</option>

                    {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.employee_no
                                ? `${employee.employee_no} - ${employee.full_name}`
                                : employee.full_name}
                        </option>
                    ))}
                </select>

                <label className="mt-4 block text-sm">
                    Payroll Month
                </label>

                <input
                    type="month"
                    value={periodMonth ? periodMonth.slice(0, 7) : ""}
                    onChange={(e) =>
                        setPeriodMonth(`${e.target.value}-01`)
                    }
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">
                    Basic Salary (MVR)
                </label>

                <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">
                    Allowances (MVR)
                </label>

                <input
                    type="number"
                    value={allowances}
                    onChange={(e) => setAllowances(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">
                    Non-Cash Benefits (MVR)
                </label>

                <input
                    type="number"
                    value={nonCashBenefits}
                    onChange={(e) => setNonCashBenefits(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">
                    Employee Pension Contribution (MVR)
                </label>

                <input
                    type="number"
                    value={employeePension}
                    onChange={(e) => setEmployeePension(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                />

                <label className="mt-4 block text-sm">
                    Payment Status
                </label>

                <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                </select>

                <button
                    onClick={savePayroll}
                    className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
                >
                    Save Payroll
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