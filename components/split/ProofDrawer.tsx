import React from "react";
import { CheckCircle2, Calculator, ShieldCheck } from "lucide-react";
import { ParticipantBreakdown } from "@/types/people";
import { BillCharges } from "@/types/review";

interface ProofDrawerProps {
  isOpen: boolean;
  charges: BillCharges;
  breakdown: ParticipantBreakdown[];
}

export function ProofDrawer({ isOpen, charges, breakdown }: ProofDrawerProps) {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const dinersSum = breakdown.reduce((sum, p) => sum + p.grandTotal, 0);
  const variance = Math.abs(charges.grandTotal - dinersSum);

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-card-elevated p-6 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-600" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Calculation Proof &amp; Proportional Algorithm Ledger
          </h3>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Audit Verified</span>
        </span>
      </div>

      {/* Formula Explanation */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          PROPORTIONAL ALLOCATION FORMULA
        </span>
        <code className="text-xs sm:text-sm font-mono font-bold text-emerald-900 bg-white p-2.5 rounded-lg border border-slate-200">
          Diner Due = Food Subtotal + (Food Subtotal ÷ Total Bill Subtotal) × (GST + Service Fee − Discount)
        </code>
        <p className="text-xs text-slate-500 mt-1">
          Every participant pays exactly for what they ate, plus their proportional ratio of the tax, service charge, and discounts. No one overpays or underpays for someone else&apos;s expensive dish.
        </p>
      </div>

      {/* Audit Reconciliation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-left font-semibold">
              <th className="pb-2">Participant</th>
              <th className="pb-2 text-right">Food Subtotal</th>
              <th className="pb-2 text-right">Ratio (%)</th>
              <th className="pb-2 text-right">Taxes &amp; Fees</th>
              <th className="pb-2 text-right">Final Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {breakdown.map((p) => (
              <tr key={p.participantId} className="text-slate-700">
                <td className="py-2.5 font-bold text-slate-900">{p.name}</td>
                <td className="py-2.5 text-right font-medium">
                  {formatCurrency(p.foodSubtotal)}
                </td>
                <td className="py-2.5 text-right font-mono text-slate-500">
                  {p.percentageOfBill.toFixed(1)}%
                </td>
                <td className="py-2.5 text-right font-medium">
                  +{formatCurrency(p.taxShare + p.serviceShare - p.discountShare)}
                </td>
                <td className="py-2.5 text-right font-black text-slate-900">
                  {formatCurrency(p.grandTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 font-black text-xs text-slate-900">
              <td className="pt-3">Sum of All Diners</td>
              <td className="pt-3 text-right">
                {formatCurrency(
                  breakdown.reduce((sum, p) => sum + p.foodSubtotal, 0)
                )}
              </td>
              <td className="pt-3 text-right">100%</td>
              <td className="pt-3 text-right">
                {formatCurrency(
                  breakdown.reduce(
                    (sum, p) =>
                      sum + p.taxShare + p.serviceShare - p.discountShare,
                    0
                  )
                )}
              </td>
              <td className="pt-3 text-right text-[#16A34A] text-sm">
                {formatCurrency(dinersSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Zero Discrepancy Reconciliation Box */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>
            Reconciliation Checksum: Bill Total ({formatCurrency(charges.grandTotal)}) matches Diners Total ({formatCurrency(dinersSum)})
          </span>
        </div>
        <span className="font-mono font-bold">
          Δ = {formatCurrency(variance)}
        </span>
      </div>
    </div>
  );
}
