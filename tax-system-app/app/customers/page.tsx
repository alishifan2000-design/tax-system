"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading customers...");

  useEffect(() => {
    async function loadCustomers() {
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

      const { data, error } = await supabase
        .from("customers")
        .select("id, customer_name, tin, email, phone, address, created_at")
        .eq("organization_id", membership.organization_id)
        .order("customer_name");

      if (error) {
        setMessage(error.message);
        return;
      }

      setCustomers(data ?? []);
      setMessage("");
    }

    loadCustomers();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">TAX SYSTEM</p>
            <h1 className="mt-1 text-3xl font-bold">Customers</h1>
          </div>

          <a
            href="/customers/new"
            className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Add Customer
          </a>
        </div>

        {message ? (
          <p className="mt-6 text-slate-300">{message}</p>
        ) : customers.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-slate-900 p-6">
            <p className="text-slate-300">No customers found.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-2xl bg-slate-900 p-5"
              >
                <h2 className="text-xl font-semibold">
                  {customer.customer_name}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>TIN: {customer.tin || "Not set"}</p>
                  <p>Email: {customer.email || "Not set"}</p>
                  <p>Phone: {customer.phone || "Not set"}</p>
                  <p>Address: {customer.address || "Not set"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}