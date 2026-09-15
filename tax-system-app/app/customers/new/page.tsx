"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewCustomerPage() {
  const [customerName, setCustomerName] = useState("");
  const [tin, setTin] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  async function saveCustomer() {
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

    const { error } = await supabase.from("customers").insert([
      {
        organization_id: membership.organization_id,
        customer_name: customerName,
        tin: tin || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Customer created successfully.");
    setCustomerName("");
    setTin("");
    setEmail("");
    setPhone("");
    setAddress("");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-8">
        <p className="text-sm text-slate-400">TAX SYSTEM</p>

        <h1 className="mt-2 text-3xl font-bold">Add Customer</h1>

        <label className="mt-6 block text-sm">Customer Name</label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Customer or company name"
        />

        <label className="mt-4 block text-sm">TIN</label>
        <input
          value={tin}
          onChange={(e) => setTin(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Tax Identification Number"
        />

        <label className="mt-4 block text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="customer@example.com"
        />

        <label className="mt-4 block text-sm">Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Phone number"
        />

        <label className="mt-4 block text-sm">Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-800 p-3"
          placeholder="Customer address"
          rows={3}
        />

        <button
          onClick={saveCustomer}
          className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-slate-950"
        >
          Save Customer
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        )}
      </div>
    </main>
  );
}