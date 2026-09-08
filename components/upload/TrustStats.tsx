import React from "react";
import { motion } from "framer-motion";
import { Banknote } from "lucide-react";
import { TRUST_STATS } from "@/lib/mock-data";

export function TrustStats() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-soft px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        {/* Left: Volume Stats */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-extrabold text-slate-900 leading-tight">
              {TRUST_STATS.totalSplit}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {TRUST_STATS.mealCount}
            </span>
          </div>
        </div>

        {/* Right: Social Proof & Rating */}
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2 overflow-hidden py-0.5">
            {TRUST_STATS.avatars.map((avatar, idx) => (
              <div
                key={idx}
                className="relative inline-block w-7 h-7 rounded-full ring-2 ring-white overflow-hidden bg-slate-200 shrink-0 shadow-xs"
              >
                <img
                  src={avatar.src}
                  alt={avatar.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
            {TRUST_STATS.rating}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
