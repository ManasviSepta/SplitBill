import React from "react";
import { motion } from "framer-motion";
import { PAYMENT_APPS } from "@/lib/mock-data";

export function PaymentApps() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="bg-[#F1F5F2]/80 border border-slate-200/80 rounded-[24px] p-8 sm:p-10 text-center"
      >
        {/* Sub-heading */}
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          SEAMLESS SETTLE UP
        </p>

        {/* Title */}
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-6">
          Export deep-links directly to Indian payment apps
        </h3>

        {/* Payment App Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {PAYMENT_APPS.map((app, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs sm:text-[13px] font-semibold text-slate-700 shadow-xs hover:border-emerald-300 transition-colors select-none"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
              <span>{app.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
