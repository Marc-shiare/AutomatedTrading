"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/auth/components/AuthProvider";
import { logout as logoutService } from "@/app/auth/service";

export default function Header() {
  const { user, logout: setLogout } = useAuth();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutService();
    setLogout();
    router.replace("/login");
  };

  return (
    <header className="h-16 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search strategies, symbols..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-800">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-neutral-900" />
        </button>

        {/* User */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-3 pl-4 border-l border-neutral-800 hover:bg-neutral-800/50 rounded-lg py-1 px-2 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-neutral-200">
                {user?.name || "Trader"}
              </div>
              <div className="text-xs text-neutral-500">{user?.role || "Admin"}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </button>

          <AnimatePresence>
            {showLogout && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-neutral-800">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email || "trader@quantumtrade.com"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">Signed in</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
