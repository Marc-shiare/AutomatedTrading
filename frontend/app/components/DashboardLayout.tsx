"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/app/auth/components/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex h-screen bg-neutral-950 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render dashboard content if not authenticated
  if (!isAuthenticated && pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
