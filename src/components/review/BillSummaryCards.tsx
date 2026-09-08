import React from "react";
import { ShoppingBag, Landmark, Sparkles, Tag, CheckCircle2 } from "lucide-react";
import { BillCharges } from "@/types/review";

interface BillSummaryCardsProps {
  charges: BillCharges;
  itemCount: number;
}

export function BillSummaryCards({ charges, itemCount }: BillSummaryCardsProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Items Subtotal */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Items Subtotal</span>
          <ShoppingBag className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2.5">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatCurrency(charges.subtotal)}
          </span>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {itemCount} line items
          </p>
        </div>
      </div>

      {/* 2. GST (5.0%) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>GST ({charges.gstRate.toFixed(1)}%)</span>
          <Landmark className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2.5">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatCurrency(charges.gstAmount)}
          </span>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {charges.cgstRate}% CGST + {charges.sgstRate}% SGST
          </p>
        </div>
      </div>

      {/* 3. Service Fee */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Service Fee</span>
          <Sparkles className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2.5">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatCurrency(charges.serviceFeeAmount)}
          </span>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {charges.serviceFeeRate}% discretionary
          </p>
        </div>
      </div>

      {/* 4. Offer Discount */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Offer Discount</span>
          <Tag className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2.5">
          <span className="text-lg sm:text-xl font-extrabold text-[#16A34A]">
            -{formatCurrency(charges.discountAmount)}
          </span>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {charges.discountLabel}
          </p>
        </div>
      </div>

      {/* 5. Grand Settle Total (Emerald Accent Card) */}
      <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-2xl border border-emerald-600 shadow-md p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
          <span>Grand Settle Total</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        </div>
        <div className="mt-2.5">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatCurrency(charges.grandTotal)}
          </span>
          <div className="mt-1">
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md">
              Balanced 100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
