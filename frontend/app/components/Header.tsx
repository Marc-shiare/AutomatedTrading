"use client";

import { Bell, Search, User } from "lucide-react";

export default function Header() {
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
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-800">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-neutral-200">Trader</div>
            <div className="text-xs text-neutral-500">Admin</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
