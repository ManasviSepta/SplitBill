import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { SettlementBanner } from "@/components/split/SettlementBanner";
import { RestaurantSummary } from "@/components/split/RestaurantSummary";
import { OrganizerCard } from "@/components/split/OrganizerCard";
import { ParticipantBillingCard } from "@/components/split/ParticipantBillingCard";
import { calculateSplit, ParticipantSplitResult } from "@/services/api";
import { ParticipantBreakdown } from "@/types/people";
import { toast } from "sonner";

export function SplitPage() {
  const navigate = useNavigate();
  const {
    charges,
    restaurant,
    participants,
    receiptItems,
    assignments,
    organizerId,
    isUploaded,
    getParticipantBreakdown,
    resetReceipt,
    setStep,
  } = useSplitStore();

  const [backendBreakdown, setBackendBreakdown] = useState<ParticipantBreakdown[] | null>(null);

  useEffect(() => {
    if (!isUploaded || receiptItems.length === 0 || participants.length === 0) {
      navigate("/");
      return;
    }
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch calculation from backend API
    const fetchBackendSplit = async () => {
      try {
        const payload = {
          items: receiptItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            category: item.category,
          })),
          charges: {
            subtotal: charges.subtotal,
            gst: charges.gstAmount,
            serviceCharge: charges.serviceFeeAmount,
            discount: charges.discountAmount,
            grandTotal: charges.grandTotal,
          },
          participants: participants.map((p) => ({
            id: p.id,
            name: p.name,
            color: p.color,
            avatarInitials: p.avatarInitials,
            isYou: p.isYou,
          })),
          assignments,
        };

        const res = await calculateSplit(payload);
        if (res.success && res.participants) {
          const mapped: ParticipantBreakdown[] = res.participants.map((p) => ({
            participantId: p.id,
            name: p.name,
            initials: p.initials || p.name.slice(0, 2).toUpperCase(),
            color: p.color || "#16A34A",
            isYou: p.isYou,
            itemCount: p.items.length,
            itemNames: p.items.map((i) => i.name),
            foodSubtotal: p.foodSubtotal,
            taxShare: p.gstShare,
            serviceShare: p.serviceChargeShare,
            discountShare: p.discountShare,
            grandTotal: p.finalAmount,
            percentageOfBill: p.percentageOfBill || 0,
          }));
          setBackendBreakdown(mapped);
        }
      } catch (err) {
        console.warn("Using local split calculation engine fallback:", err);
      }
    };

    fetchBackendSplit();
  }, [
    isUploaded,
    receiptItems,
    participants,
    assignments,
    charges,
    navigate,
    setStep,
  ]);

  const breakdown = backendBreakdown || getParticipantBreakdown();
  const dinersSum = breakdown.reduce((sum, p) => sum + p.grandTotal, 0);

  const activeOrganizer =
    participants.find((p) => p.id === organizerId) ||
    participants.find((p) => p.isYou) ||
    participants[0];

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleShareSummary = () => {
    const textLines = [
      `🧾 ${restaurant.name || "Restaurant"} — Settlement Summary`,
      `Total Restaurant Bill: ${formatCurrency(charges.grandTotal)}`,
      `Paid Upfront By: ${activeOrganizer?.name || "Organizer"}`,
      `---------------------------------------`,
      `Individual Breakdown:`,
      ...breakdown.map((p) => {
        const isOrg = p.participantId === activeOrganizer?.id;
        return `• ${p.name}: ${formatCurrency(p.grandTotal)} ${
          isOrg ? "(Organizer Share)" : "(Amount Owed)"
        }`;
      }),
      `---------------------------------------`,
      `Split via SplitBill Engine`,
    ];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textLines.join("\n"));
      toast.success("Settlement summary copied to clipboard!");
    }
  };

  const handleShareWhatsApp = () => {
    const textLines = [
      `🧾 *${restaurant.name || "Restaurant Bill"} — Split Summary*`,
      `Total Bill: *${formatCurrency(charges.grandTotal)}*`,
      `Bill Paid By: *${activeOrganizer?.name || "Organizer"}*`,
      `------------------------`,
      `*Amounts to Reimburse:*`,
      ...breakdown.map((p) => {
        const isOrg = p.participantId === activeOrganizer?.id;
        return `• *${p.name}*: ${formatCurrency(p.grandTotal)} ${
          isOrg ? "_(Already Paid Bill)_" : ""
        }`;
      }),
      `------------------------`,
      `Calculated proportionally via SplitBill`,
    ];
    const url = `https://wa.me/?text=${encodeURIComponent(textLines.join("\n"))}`;
    window.open(url, "_blank");
  };

  const handleDownloadReceipt = () => {
    toast.info("Downloading settlement report...");
    const element = document.createElement("a");
    const file = new Blob(
      [
        `========================================\n` +
          `${restaurant.name || "Restaurant Receipt"} - SETTLEMENT REPORT\n` +
          `Date: ${restaurant.timestamp || new Date().toLocaleDateString()}\n` +
          `Total Restaurant Bill: ₹${charges.grandTotal.toFixed(2)}\n` +
          `Paid Upfront By: ${activeOrganizer?.name || "Organizer"}\n` +
          `========================================\n\n` +
          `PARTICIPANT BREAKDOWN:\n` +
          breakdown
            .map(
              (p) =>
                `• ${p.name}: ₹${p.grandTotal.toFixed(2)}\n` +
                `   - Food Subtotal: ₹${p.foodSubtotal.toFixed(2)}\n` +
                `   - Proportional Taxes: ₹${p.taxShare.toFixed(2)}\n` +
                `   - Service Charge: ₹${p.serviceShare.toFixed(2)}\n` +
                (p.discountShare > 0
                  ? `   - Discount: -₹${p.discountShare.toFixed(2)}\n`
                  : "") +
                `   - Items (${p.itemCount}): ${p.itemNames.join(", ")}\n`
            )
            .join("\n") +
          `\n========================================\n` +
          `Generated with SplitBill Engine\n`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `splitbill-${(restaurant.name || "receipt")
      .toLowerCase()
      .replace(/\s+/g, "-")}-settlement.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-6 pb-28">
      {/* 1. Settlement Verified Banner */}
      <SettlementBanner
        grandTotal={charges.grandTotal}
        calculatedSum={dinersSum}
      />

      {/* 2. Primary Organizer Card (Bill Paid By + Personal QR Upload Only) */}
      <OrganizerCard grandTotal={charges.grandTotal} />

      {/* 3. Participant Individual Billing Cards Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Participant Billing Cards
          </h2>
          <span className="text-[11px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
            {participants.length} Diners
          </span>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Individual item breakdown &amp; amounts owed
        </span>
      </div>

      {/* 4. Participant Billing Cards List */}
      <div className="flex flex-col gap-4">
        {breakdown.map((p) => (
          <ParticipantBillingCard
            key={p.participantId}
            breakdown={p}
            receiptItems={receiptItems}
            assignments={assignments}
            grandTotal={charges.grandTotal}
          />
        ))}
      </div>

      {/* 5. Summary & Report Actions (Share Summary / WhatsApp / Download Receipt) */}
      <RestaurantSummary
        restaurant={restaurant}
        grandTotal={charges.grandTotal}
        peopleCount={participants.length}
        itemCount={receiptItems.length}
        onShareSummary={handleShareSummary}
        onShareWhatsApp={handleShareWhatsApp}
        onDownloadReceipt={handleDownloadReceipt}
      />

      {/* 6. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3.5 px-4 sm:px-6 shadow-card-elevated">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/assign-items"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Edit Assignments</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Verified Total:</span>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-soft transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Start New Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}

