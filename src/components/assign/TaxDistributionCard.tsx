import React from "react";
import { Landmark } from "lucide-react";
import { BillCharges } from "@/types/review";

interface TaxDistributionCardProps {
  charges: BillCharges;
}

export function TaxDistributionCard({ charges }: TaxDistributionCardProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalExtra = charges.gstAmount + charges.serviceFeeAmount - charges.discountAmount;

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Landmark className="w-4 h-4" />
          <span>Taxes &amp; Service Charge</span>
        </div>
        <span className="font-extrabold text-slate-900">
          {formatCurrency(totalExtra)}
        </span>
      </div>

      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
        GST ({charges.gstRate.toFixed(1)}%) + Service ({charges.serviceFeeRate}%) weighted proportionally based on each person&apos;s food subtotal.
      </p>
    </div>
  );
}
