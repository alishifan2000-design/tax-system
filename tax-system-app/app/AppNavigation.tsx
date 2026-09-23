"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SignOutButton from "./SignOutButton";

export default function AppNavigation() {
    const pathname = usePathname();

    const navClass = (href: string) => {
        const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

        return `rounded-lg px-3 py-2 ${active
            ? "bg-white font-semibold text-slate-950"
            : "bg-slate-800 text-white hover:bg-slate-700"
            }`;
    };

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
                    <a href="/" className={navClass("/")}>
                        Dashboard
                    </a>

                    <a href="/projects" className={navClass("/projects")}>
                        Projects
                    </a>

                    <a href="/transactions" className={navClass("/transactions")}>
                        Transactions
                    </a>

                    <a href="/payroll" className={navClass("/payroll")}>
                        Payroll
                    </a>

                    <a href="/customers" className={navClass("/customers")}>
                        Customers
                    </a>

                    <a href="/suppliers" className={navClass("/suppliers")}>
                        Suppliers
                    </a>

                    <a href="/tax-periods" className={navClass("/tax-periods")}>
                        Tax Periods
                    </a>

                    <a href="/tax-rates" className={navClass("/tax-rates")}>
                        Tax Rates
                    </a>

                    <a
                        href="/my-tax-period-requests"
                        className={navClass("/my-tax-period-requests")}
                    >
                        My Requests
                    </a>

                    <SignOutButton />
                </nav>
            </div>
        </header>
    );
}