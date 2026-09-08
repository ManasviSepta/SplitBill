import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { SettlementBanner } from "@/components/split/SettlementBanner";
import { RestaurantSummary } from "@/components/split/RestaurantSummary";
import { ProportionalLedgerBar } from "@/components/split/ProportionalLedgerBar";
import { ParticipantAmountCard } from "@/components/split/ParticipantAmountCard";
import { TrustGuaranteeCard } from "@/components/split/TrustGuaranteeCard";
import { ProofDrawer } from "@/components/split/ProofDrawer";
import { toast } from "sonner";

export function SplitPage() {
  const navigate = useNavigate();
  const {
    charges,
    restaurant,
    participants,
    receiptItems,
    assignments,
    getParticipantBreakdown,
    resetReceipt,
    setStep,
  } = useSplitStore();

  const [isProofDrawerOpen, setIsProofDrawerOpen] = useState(false);

  useEffect(() => {
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setStep]);

  const breakdown = getParticipantBreakdown();
  const dinersSum = breakdown.reduce((sum, p) => sum + p.grandTotal, 0);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCopyAllUPI = () => {
    const textLines = [
      `🧾 ${restaurant.name} — Bill Settlement Summary`,
      `Total Bill: ${formatCurrency(charges.grandTotal)}`,
      `---------------------------------------`,
      ...breakdown.map(
        (p) =>
          `• ${p.name}: ${formatCurrency(p.grandTotal)} (${p.itemCount} items) | UPI: upi://pay?pa=${p.initials.toLowerCase()}@upi&pn=${encodeURIComponent(
            p.name
          )}&am=${p.grandTotal}`
      ),
      `---------------------------------------`,
      `Verified with SplitBill AI Engine`,
    ];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textLines.join("\n"));
      toast.success("All UPI settlement links copied to clipboard!");
    }
  };

  const handleShareWhatsApp = () => {
    const textLines = [
      `🧾 *${restaurant.name} — Split Summary*`,
      `Total: ${formatCurrency(charges.grandTotal)}`,
      `------------------------`,
      ...breakdown.map(
        (p) => `• *${p.name}*: ${formatCurrency(p.grandTotal)}`
      ),
      `------------------------`,
      `Split cleanly via SplitBill`,
    ];
    const url = `https://wa.me/?text=${encodeURIComponent(textLines.join("\n"))}`;
    window.open(url, "_blank");
  };

  const handleDownloadReceipt = () => {
    toast.info("Downloading formatted settlement PDF/Text summary...");
    const element = document.createElement("a");
    const file = new Blob(
      [
        `${restaurant.name} - Settlement Report\nDate: ${new Date().toLocaleDateString()}\nTotal: ₹${charges.grandTotal}\n\n` +
          breakdown
            .map(
              (p) =>
                `${p.name}: ₹${p.grandTotal} (Food: ₹${p.foodSubtotal}, Taxes: ₹${p.taxShare + p.serviceShare}, Disc: ₹${p.discountShare})`
            )
            .join("\n"),
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `splitbill-${restaurant.name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-6 pb-24">
      {/* 1. Settlement Verified Banner */}
      <SettlementBanner
        grandTotal={charges.grandTotal}
        calculatedSum={dinersSum}
      />

      {/* 2. Restaurant Summary Card with UPI / WhatsApp / Download actions */}
      <RestaurantSummary
        restaurant={restaurant}
        grandTotal={charges.grandTotal}
        peopleCount={participants.length}
        itemCount={receiptItems.length}
        onCopyAllUPI={handleCopyAllUPI}
        onShareWhatsApp={handleShareWhatsApp}
        onDownloadReceipt={handleDownloadReceipt}
      />

      {/* 3. Proportional Split Ledger Multi-segment Bar */}
      <ProportionalLedgerBar
        breakdown={breakdown}
        onToggleAlgorithmMath={() => setIsProofDrawerOpen(!isProofDrawerOpen)}
      />

      {/* 4. Participant Allocation Cards Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Participant Allocations
          </h2>
          <span className="text-[11px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
            Sorted by amount
          </span>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Tax &amp; Service Charge normalized
        </span>
      </div>

      {/* 5. Participant Allocation Cards */}
      <div className="flex flex-col gap-3.5">
        {breakdown.map((p, idx) => (
          <ParticipantAmountCard
            key={p.participantId}
            breakdown={p}
            receiptItems={receiptItems}
            assignments={assignments}
            isTopShare={idx === 0}
            grandTotal={charges.grandTotal}
          />
        ))}
      </div>

      {/* 6. Transparent Mathematical Trust Guarantee Card */}
      <TrustGuaranteeCard
        isDrawerOpen={isProofDrawerOpen}
        onToggleDrawer={() => setIsProofDrawerOpen(!isProofDrawerOpen)}
      />

      {/* 7. Collapsible Proof Drawer */}
      <ProofDrawer
        isOpen={isProofDrawerOpen}
        charges={charges}
        breakdown={breakdown}
      />

      {/* 8. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 sm:px-6 shadow-card-elevated">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/assign-items"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Edit Assignments</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Sum Verification:</span>
            <span className="font-extrabold text-[#16A34A] font-mono">
              {formatCurrency(dinersSum)} / {formatCurrency(charges.grandTotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              resetReceipt();
              navigate("/");
            }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-soft transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Start New Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
