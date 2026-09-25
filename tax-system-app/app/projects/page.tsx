"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatMaldivesDate } from "@/lib/dateTime";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading projects...");

  useEffect(() => {
    async function loadProjects() {
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
        .from("projects")
        .select(
          "id, project_code, project_name, island, atoll, customer_name, contract_value, status"
        )
        .eq("organization_id", membership.organization_id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setProjects(data ?? []);
      setMessage("");
    }

    loadProjects();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">TAX SYSTEM</p>
            <h1 className="mt-1 text-3xl font-bold">Projects</h1>
          </div>

          <a
            href="/projects/new"
            className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Add Project
          </a>
        </div>

        {message ? (
          <p className="mt-6 text-slate-300">{message}</p>
        ) : projects.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-slate-900 p-6">
            <p className="text-slate-300">No projects found.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">
                      {project.project_code || "No code"}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {project.project_name}
                    </h2>
                  </div>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                    {project.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>
                    Location:{" "}
                    {[project.island, project.atoll]
                      .filter(Boolean)
                      .join(", ") || "Not set"}
                  </p>

                  <p>
                    Customer: {project.customer_name || "Not set"}
                  </p>

                  <p>
                    Contract Value: MVR{" "}
                    {Number(project.contract_value || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}