import React from "react";
import { Sparkles, ShieldCheck, Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <span className="font-bold text-base text-slate-900">SplitBill</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Split the bill. Not the friendship.
          </p>
        </div>

        {/* Center: Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini 1.5 Pro OCR</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bank-grade Split Accuracy</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Share2 className="w-3.5 h-3.5" />
            <span>Export to UPI / WhatsApp</span>
          </div>
        </div>

        {/* Right: Copyright */}
        <div className="text-xs text-slate-400 font-medium text-center md:text-right">
          © 2025 SplitBill AI Technologies
        </div>
      </div>
    </footer>
  );
}
