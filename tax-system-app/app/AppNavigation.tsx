"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SignOutButton from "./SignOutButton";

export default function AppNavigation() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        async function checkSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setIsLoggedIn(!!session);
        }

        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (pathname === "/login" || !isLoggedIn) {
        return null;
    }

    return (
        <header className="border-b border-slate-800 bg-slate-900">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <a href="/" className="whitespace-nowrap text-lg font-bold">
                    TAX SYSTEM
                </a>

                <nav className="flex w-full flex-wrap gap-2 text-sm sm:w-auto sm:flex-nowrap">
                    <a href="/" className="rounded-lg bg-slate-800 px-3 py-2">
                        Dashboard
                    </a>

                    <a href="/projects" className="rounded-lg bg-slate-800 px-3 py-2">
                        Projects
                    </a>

                    <a
                        href="/transactions"
                        className="rounded-lg bg-slate-800 px-3 py-2"
                    >
                        Transactions
                    </a>

                    <a
                        href="/payroll"
                        className="rounded-lg bg-slate-800 px-3 py-2"
                    >
                        Payroll
                    </a>

                    <a href="/customers" className="rounded-lg bg-slate-800 px-3 py-2">
                        Customers
                    </a>

                    <a href="/suppliers" className="rounded-lg bg-slate-800 px-3 py-2">
                        Suppliers
                    </a>

                    <a
                        href="/tax-periods"
                        className="rounded-lg bg-slate-800 px-3 py-2"
                    >
                        Tax Periods
                    </a>

                    <SignOutButton />
                </nav>
            </div>
        </header>
    );
}