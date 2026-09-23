"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewSupplierPage() {
  const [supplierName, setSupplierName] = useState("");
  const [tin, setTin] = useState("");
  const [country, setCountry] = useState("Maldives");
  const [residentStatus, setResidentStatus] = useState("resident");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function saveSupplier() {
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

    const { error } = await supabase.from("suppliers").insert([
      {
        organization_id: membership.organization_id,
        supplier_name: supplierName,
        tin: tin || null,
        country: country || null,
        resident_status: residentStatus || null,
        email: email || null,
        phone: phone || null,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Supplier created successfully.");
    setSupplierName("");
    setTin("");
    setCountry("Maldives");
    setResidentStatus("resident");
    setEmail("");
    setPhone("");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <button
          onClick={() => window.history.back()}
          className="mb-4 text-xl text-slate-300 hover:text-white"
        >
          ←
        </button>

        <p className="text-sm text-slate-400">TAX SYSTEM</p>

        <h1 className="mt-2 text-3xl font-bold">Add Supplier</h1>

        <label className="mt-6 block text-sm">Supplier Name</label>
        <input
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Supplier or company name"
        />

        <label className="mt-4 block text-sm">TIN</label>
        <input
          value={tin}
          onChange={(e) => setTin(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Tax Identification Number"
        />

        <label className="mt-4 block text-sm">Country</label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        />

        <label className="mt-4 block text-sm">Resident Status</label>
        <select
          value={residentStatus}
          onChange={(e) => setResidentStatus(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
        >
          <option value="resident">Resident</option>
          <option value="non_resident">Non-Resident</option>
        </select>

        <label className="mt-4 block text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="supplier@example.com"
        />

        <label className="mt-4 block text-sm">Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Phone number"
        />

        <button
          onClick={saveSupplier}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Supplier
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        )}
      </div>
    </main>
  );
}