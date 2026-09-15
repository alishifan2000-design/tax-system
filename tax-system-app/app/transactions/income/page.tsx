"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddIncomePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amountExclGst, setAmountExclGst] = useState("");
  const [gstRate, setGstRate] = useState("8");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
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

      const { data: projectData } = await supabase
        .from("projects")
        .select("id, project_name")
        .eq("organization_id", membership.organization_id)
        .order("project_name");

      const { data: customerData } = await supabase
        .from("customers")
        .select("id, customer_name")
        .eq("organization_id", membership.organization_id)
        .order("customer_name");

      setProjects(projectData ?? []);
      setCustomers(customerData ?? []);
    }

    loadData();
  }, []);

  async function saveIncome() {
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
      setMessage(membershipError?.message || "Organization not found.");
      return;
    }

    const baseAmount = Number(amountExclGst || 0);
    const rate = Number(gstRate || 0);
    const gstAmount = baseAmount * (rate / 100);
    const totalAmount = baseAmount + gstAmount;

    const { error } = await supabase.from("transactions").insert([
      {
        organization_id: membership.organization_id,
        project_id: projectId || null,
        customer_id: customerId || null,
        transaction_type: "income",
        transaction_date: transactionDate || null,
        reference_no: referenceNo || null,
        description: description || null,
        category: category || null,
        currency: "MVR",
        amount_excl_gst: baseAmount,
        gst_rate: rate,
        payment_status: paymentStatus,
        created_by: user.id,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Income created successfully.");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">TAX SYSTEM</p>
        <h1 className="mt-2 text-3xl font-bold">Add Income</h1>

        <label className="mt-6 block text-sm">Date</label>
        <input
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Project</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="">No project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_name}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm">Customer</label>
        <select
          value={customerId}
          onChange={(e) => {
            const id = e.target.value;
            setCustomerId(id);

            const selected = customers.find(
              (customer) => customer.id === id
            );

            setCustomerName(selected?.customer_name || "");
          }}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="">No customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.customer_name}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm">Reference No.</label>
        <input
          value={referenceNo}
          onChange={(e) => setReferenceNo(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Example: Progress Payment"
        />

        <label className="mt-4 block text-sm">Amount Excl. GST (MVR)</label>
        <input
          type="number"
          value={amountExclGst}
          onChange={(e) => setAmountExclGst(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="0.00"
        />

        <label className="mt-4 block text-sm">GST Rate (%)</label>
        <input
          type="number"
          value={gstRate}
          onChange={(e) => setGstRate(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Payment Status</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
        </select>

        <button
          onClick={saveIncome}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Income
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        )}
      </div>
    </main>
  );
}