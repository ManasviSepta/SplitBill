import React from "react";

export function Footer() {
  return (
    <footer className="w-full mt-16 border-t border-slate-200/70 bg-white/40 backdrop-blur-xs py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-[#16A34A] text-white flex items-center justify-center font-bold text-[10px]">
            ₹
          </div>
          <span className="font-bold text-slate-800">SplitBill</span>
          <span className="text-slate-400">• Split the bill. Not the friendship.</span>
        </div>

        {/* Right: Copyright */}
        <div className="text-slate-400 font-medium">
          © 2025 SplitBill Technologies
        </div>
      </div>
    </footer>
  );
}
