import type { Metadata } from "next";
import "./globals.css";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "TAX SYSTEM",
  description: "Maldives Tax Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <a href="/" className="whitespace-nowrap text-lg font-bold">
              TAX SYSTEM
            </a>

            <nav className="flex w-full flex-wrap gap-2 text-sm sm:w-auto sm:flex-nowrap">
              <a
                href="/"
                className="rounded-lg bg-slate-800 px-3 py-2"
              >
                Dashboard
              </a>

              <a
                href="/projects"
                className="rounded-lg bg-slate-800 px-3 py-2"
              >
                Projects
              </a>

              <a
                href="/transactions"
                className="rounded-lg bg-slate-800 px-3 py-2"
              >
                Transactions
              </a>

              <a
                href="/customers"
                className="rounded-lg bg-slate-800 px-3 py-2"
              >
                Customers
              </a>

              <a
                href="/suppliers"
                className="rounded-lg bg-slate-800 px-3 py-2"
              >
                Suppliers
              </a>

              <SignOutButton />

            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}