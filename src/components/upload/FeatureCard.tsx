import React from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  ShieldCheck,
  Percent,
  Sparkles,
  Crop,
  Calculator,
} from "lucide-react";
import { FEATURE_CARDS } from "@/lib/mock-data";
import { FeatureItem } from "@/types";

export function FeatureCard({ item }: { item: FeatureItem }) {
  const getIcon = () => {
    switch (item.icon) {
      case "ocr":
        return <ScanLine className="w-5 h-5 text-[#16A34A]" />;
      case "human":
        return <ShieldCheck className="w-5 h-5 text-[#16A34A]" />;
      case "tax":
        return <Percent className="w-5 h-5 text-[#16A34A]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#16A34A]" />;
    }
  };

  const getBadgeIcon = () => {
    switch (item.badge.icon) {
      case "sparkle":
        return <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />;
      case "crop":
        return <Crop className="w-3.5 h-3.5 text-emerald-700" />;
      case "ledger":
        return <Calculator className="w-3.5 h-3.5 text-[#16A34A]" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-6 sm:p-7 flex flex-col justify-between h-full transition-shadow hover:shadow-card-elevated"
    >
      <div>
        {/* Top Icon */}
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2.5">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Bottom Badge */}
      <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/60 px-2.5 py-1 rounded-md">
          {getBadgeIcon()}
          <span>{item.badge.text}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function FeatureSection() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURE_CARDS.map((card) => (
          <FeatureCard key={card.id} item={card} />
        ))}
      </div>
    </div>
  );
}
