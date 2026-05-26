import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./auth/components/AuthProvider";

export const metadata: Metadata = {
  title: "QuantumTrade - Algorithmic Trading Platform",
  description: "Self-Optimizing Algorithmic Trading Platform with NinjaTrader 8 Integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-50 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
