"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewProjectPage() {
  const [projectCode, setProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [island, setIsland] = useState("");
  const [atoll, setAtoll] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: membership, error: membershipError } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (membershipError) return;

      const { data, error } = await supabase
        .from("customers")
        .select("id, customer_name")
        .eq("organization_id", membership.organization_id)
        .order("customer_name");

      if (!error && data) {
        setCustomers(data);
      }
    }

    loadCustomers();
  }, []);

  async function saveProject() {
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

    if (membershipError) {
      setMessage(membershipError.message);
      return;
    }

    const { error } = await supabase.from("projects").insert([
      {
        organization_id: membership.organization_id,
        project_code: projectCode || null,
        project_name: projectName,
        island: island || null,
        atoll: atoll || null,
        customer_id: customerId || null,
        customer_name: customerName || null,
        contract_value: contractValue ? Number(contractValue) : null,
        start_date: startDate || null,
        expected_end_date: expectedEndDate || null,
        status,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Project created successfully.");
    setProjectCode("");
    setProjectName("");
    setIsland("");
    setAtoll("");
    setCustomerName("");
    setContractValue("");
    setStartDate("");
    setExpectedEndDate("");
    setStatus("active");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">TAX SYSTEM</p>

        <h1 className="mt-2 text-3xl font-bold">
          Add Project
        </h1>

        <label className="mt-6 block text-sm">
          Project Code
        </label>

        <input
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Example: FC-2026-001"
        />

        <label className="mt-4 block text-sm">
          Customer / Client
        </label>

        <select
          value={customerId}
          onChange={(e) => {
            const selectedId = e.target.value;
            setCustomerId(selectedId);

            const selectedCustomer = customers.find(
              (customer) => customer.id === selectedId
            );

            setCustomerName(selectedCustomer?.customer_name || "");
          }}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="">Select customer</option>

          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.customer_name}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm">
          Island
        </label>

        <input
          value={island}
          onChange={(e) => setIsland(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Example: Kihavah"
        />

        <label className="mt-4 block text-sm">
          Atoll
        </label>

        <input
          value={atoll}
          onChange={(e) => setAtoll(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Example: Baa Atoll"
        />

        <label className="mt-4 block text-sm">
          Customer / Client
        </label>

        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Client or resort name"
        />

        <label className="mt-4 block text-sm">
          Contract Value (MVR)
        </label>

        <input
          type="number"
          value={contractValue}
          onChange={(e) => setContractValue(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="0.00"
        />

        <label className="mt-4 block text-sm">
          Start Date
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">
          Expected End Date
        </label>

        <input
          type="date"
          value={expectedEndDate}
          onChange={(e) => setExpectedEndDate(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>

        <button
          onClick={saveProject}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Project
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