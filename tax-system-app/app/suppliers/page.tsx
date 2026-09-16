"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading suppliers...");

  useEffect(() => {
    async function loadSuppliers() {
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
        .from("suppliers")
        .select(
          "id, supplier_name, tin, country, resident_status, email, phone, created_at"
        )
        .eq("organization_id", membership.organization_id)
        .order("supplier_name");

      if (error) {
        setMessage(error.message);
        return;
      }

      setSuppliers(data ?? []);
      setMessage("");
    }

    loadSuppliers();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">TAX SYSTEM</p>
            <h1 className="mt-1 text-3xl font-bold">Suppliers</h1>
          </div>

          <a
            href="/suppliers/new"
            className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Add Supplier
          </a>
        </div>

        {message ? (
          <p className="mt-6 text-slate-300">{message}</p>
        ) : suppliers.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-slate-900 p-6">
            <p className="text-slate-300">No suppliers found.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="rounded-2xl bg-slate-900 p-5"
              >
                <h2 className="text-xl font-semibold">
                  {supplier.supplier_name}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>TIN: {supplier.tin || "Not set"}</p>
                  <p>Country: {supplier.country || "Not set"}</p>
                  <p>
                    Resident Status:{" "}
                    {supplier.resident_status || "Not set"}
                  </p>
                  <p>Email: {supplier.email || "Not set"}</p>
                  <p>Phone: {supplier.phone || "Not set"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}