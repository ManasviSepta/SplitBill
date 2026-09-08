import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Link2, MessageSquare, Shield, Check, QrCode } from "lucide-react";
import { ParticipantBreakdown } from "@/types/people";
import { ReceiptItem } from "@/types/review";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ParticipantAmountCardProps {
  breakdown: ParticipantBreakdown;
  receiptItems: ReceiptItem[];
  assignments: Record<string, string[]>;
  isTopShare?: boolean;
  grandTotal: number;
}

export function ParticipantAmountCard({
  breakdown,
  receiptItems,
  assignments,
  isTopShare = false,
  grandTotal,
}: ParticipantAmountCardProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Generate clean UPI ID based on participant name
  const upiUsername = breakdown.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const upiId = `${upiUsername || "diner"}@upi`;

  // Standard UPI URI format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR
  const upiPaymentUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    breakdown.name
  )}&am=${breakdown.grandTotal.toFixed(2)}&cu=INR`;

  const handleCopyUPIId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      toast.success("UPI ID copied.");
    }
  };

  const handleCopyPaymentLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiPaymentUri);
      toast.success("Payment link copied.");
    }
  };

  const handleWhatsAppReminder = () => {
    const text = `Hey ${breakdown.name}, your share for the meal is ${formatCurrency(
      breakdown.grandTotal
    )}. Pay via UPI ID: ${upiId} or tap: ${upiPaymentUri}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Dishes assigned to this participant
  const assignedDishes = receiptItems.filter((item) =>
    (assignments[item.id] || []).includes(breakdown.participantId)
  );

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-6 sm:p-7 flex flex-col gap-6 transition-all hover:shadow-card-elevated">
      {/* Top Header Row: Avatar, Name, Role, Amount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5 min-w-0">
          <ParticipantAvatar
            initials={breakdown.initials}
            avatarColor={breakdown.color}
            size="lg"
          />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                {breakdown.name}
              </h3>

              {breakdown.isYou && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16A34A] text-white">
                  <Shield className="w-2.5 h-2.5" />
                  <span>YOU (ORGANIZER)</span>
                </span>
              )}

              {isTopShare && !breakdown.isYou && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  TOP SHARE
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
              <span className="font-mono text-slate-600 font-semibold">{upiId}</span>
              <span>•</span>
              <span>
                {assignedDishes.length} item{assignedDishes.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Highlight */}
        <div className="text-left sm:text-right bg-emerald-50/60 border border-emerald-100/80 rounded-2xl px-4 py-2.5 self-start sm:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80 block">
            {breakdown.isYou ? "YOUR SHARE" : "FINAL PAYABLE AMOUNT"}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-[#16A34A]">
            {formatCurrency(breakdown.grandTotal)}
          </span>
        </div>
      </div>

      {/* QR Code Container & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#FBFDFB] border border-slate-200/80 rounded-2xl p-5 sm:p-6">
        {/* Left: QR Code Box */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-center">
            <QRCodeSVG
              value={upiPaymentUri}
              size={180}
              level="M"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>

          <span className="text-xs font-bold text-slate-700 mt-2.5 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scan with any UPI app</span>
          </span>

          {/* UPI App Support Chips */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
              Google Pay
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
              PhonePe
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
              Paytm
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
              BHIM UPI
            </span>
          </div>
        </div>

        {/* Right: Payment Details & Direct Copy Actions */}
        <div className="flex-1 flex flex-col justify-between gap-4 w-full">
          <div className="flex flex-col gap-1.5 text-xs text-slate-600 bg-white border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Payable To:</span>
              <strong className="text-slate-800">{breakdown.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">UPI VPA:</span>
              <strong className="font-mono text-slate-800">{upiId}</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
              <span>Amount:</span>
              <span className="text-[#16A34A]">{formatCurrency(breakdown.grandTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyUPIId}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy UPI ID</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPaymentLink}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copy Payment Link</span>
            </button>

            {!breakdown.isYou && (
              <button
                type="button"
                onClick={handleWhatsAppReminder}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Send WhatsApp payment link"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
