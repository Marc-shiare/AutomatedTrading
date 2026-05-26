"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
        </motion.div>
        <div className="text-center">
          <p className="text-neutral-400 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
