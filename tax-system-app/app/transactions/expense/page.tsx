"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddExpensePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amountExclGst, setAmountExclGst] = useState("");
  const [gstRate, setGstRate] = useState("8");
  const [nwtApplicable, setNwtApplicable] = useState(false);
  const [nwtRate, setNwtRate] = useState("");
  const [nwtAmount, setNwtAmount] = useState("");
  const [nwtPaymentType, setNwtPaymentType] = useState("");
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

      const { data: supplierData } = await supabase
        .from("suppliers")
        .select("id, supplier_name")
        .eq("organization_id", membership.organization_id)
        .order("supplier_name");

      setProjects(projectData ?? []);
      setSuppliers(supplierData ?? []);
    }

    loadData();
  }, []);

  async function saveExpense() {
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
    const calculatedNwtAmount =
      nwtApplicable && nwtRate
        ? baseAmount * (Number(nwtRate) / 100)
        : 0;

    const { error } = await supabase.from("transactions").insert([
      {
        organization_id: membership.organization_id,
        project_id: projectId || null,
        supplier_id: supplierId || null,
        transaction_type: "expense",
        transaction_date: transactionDate || null,
        reference_no: referenceNo || null,
        description: description || null,
        category: category || null,
        currency: "MVR",
        amount_excl_gst: baseAmount,
        gst_rate: rate,
        nwt_applicable: nwtApplicable,
        nwt_rate: nwtRate ? Number(nwtRate) : null,
        nwt_amount: nwtApplicable ? calculatedNwtAmount : null,
        nwt_payment_type: nwtPaymentType || null,
        payment_status: paymentStatus,
        created_by: user.id,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Expense created successfully.");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">TAX SYSTEM</p>
        <h1 className="mt-2 text-3xl font-bold">Add Expense</h1>

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

        <label className="mt-4 block text-sm">Supplier</label>
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="">No supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplier_name}
            </option>
          ))}
        </select>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={nwtApplicable}
            onChange={(e) => setNwtApplicable(e.target.checked)}
          />
          NWT Applicable
        </label>

        {nwtApplicable && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm">NWT Payment Type</label>
              <input
                type="text"
                value={nwtPaymentType}
                onChange={(e) => setNwtPaymentType(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-800 p-3"
                placeholder="e.g. Contractor payment"
              />
            </div>

            <div>
              <label className="block text-sm">NWT Rate (%)</label>
              <input
                type="number"
                value={nwtRate}
                onChange={(e) => setNwtRate(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-800 p-3"
              />
            </div>

            <div>
              <label className="block text-sm">NWT Amount (MVR)</label>
              <input
                type="number"
                value={nwtAmount}
                onChange={(e) => setNwtAmount(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-800 p-3"
              />
            </div>
          </div>
        )}

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
          placeholder="Example: Materials"
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
          onClick={saveExpense}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Expense
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        )}
      </div>
    </main>
  );
}