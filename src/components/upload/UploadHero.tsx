import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { TRUST_CHIPS } from "@/lib/mock-data";

export function UploadHero() {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-6 sm:pt-10 pb-6 px-4">
      {/* Main Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.15]"
      >
        Split the bill. <span className="text-[#16A34A]">Not the friendship.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl"
      >
        AI-powered dining receipt parser. Upload your restaurant slip, let Gemini extract
        line items, taxes, and service charges in seconds, and split fair down to the
        exact rupee.
      </motion.p>

      {/* Trust Chips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-7"
      >
        {TRUST_CHIPS.map((chip, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] fill-emerald-100" />
            <span>{chip.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
