import type { Metadata } from "next";
import "./globals.css";
import AppNavigation from "./AppNavigation";

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
        <AppNavigation />
        {children}
      </body>
    </html>
  );
}