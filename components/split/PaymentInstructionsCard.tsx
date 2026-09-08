import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Link2,
  QrCode,
  Sparkles,
  CheckCircle2,
  ArrowDownCircle,
  HelpCircle,
} from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { toast } from "sonner";

export function PaymentInstructionsCard() {
  const {
    participants,
    organizerId,
    organizerUPI,
    organizerQRImage,
    charges,
  } = useSplitStore();

  const activeOrganizer =
    participants.find((p) => p.id === organizerId) ||
    participants.find((p) => p.isYou) ||
    participants[0];

  const defaultUpiId = activeOrganizer
    ? `${activeOrganizer.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@oksbi`
    : "organizer@upi";

  const effectiveUpiId = organizerUPI.trim() || defaultUpiId;

  const upiPaymentUri = `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(
    activeOrganizer?.name || "Organizer"
  )}&cu=INR`;

  const handleCopyUPI = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(effectiveUpiId);
      toast.success(`Copied Organizer UPI ID: ${effectiveUpiId}`);
    }
  };

  const handleCopyPaymentLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiPaymentUri);
      toast.success("UPI payment link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-6 sm:p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PAYMENT DESTINATION
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-2.5 h-2.5" />
              <span>SINGLE COLLECTOR QR</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pay the Organizer ({activeOrganizer?.name || "Collector"})
          </h2>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Scan QR &amp; pay your exact breakdown share
        </span>
      </div>

      {/* Main Payment Container: Left QR, Right Details & Instructions */}
      <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-emerald-50/20 border border-emerald-100/80 rounded-2xl p-5 sm:p-6">
        {/* Left: Organizer QR Code Box */}
        <div className="flex flex-col items-center justify-center shrink-0 text-center">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-center min-w-[190px] min-h-[190px]">
            {organizerQRImage ? (
              <img
                src={organizerQRImage}
                alt="Organizer Personal UPI QR"
                className="w-44 h-44 object-contain rounded-lg"
              />
            ) : (
              <QRCodeSVG
                value={upiPaymentUri}
                size={176}
                level="M"
                includeMargin={false}
                className="rounded-lg"
              />
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <QrCode className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>
              {organizerQRImage ? "Organizer's Uploaded QR" : "Generated UPI QR"}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 mt-0.5">
            Accepts GPay, PhonePe, Paytm, BHIM &amp; Banking
          </span>
        </div>

        {/* Right: Payment Destination Details & Instructions */}
        <div className="flex-1 flex flex-col justify-between gap-5 w-full">
          {/* Organizer VPA Box */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              {activeOrganizer && (
                <ParticipantAvatar
                  initials={activeOrganizer.avatarInitials}
                  avatarColor={activeOrganizer.color}
                  size="md"
                />
              )}

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Send UPI Payment To
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {effectiveUpiId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUPI}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy UPI</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPaymentLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          {/* Simple 3-step settlement instructions */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              HOW TO SETTLE
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Scan or Copy</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Scan the QR above or copy the UPI ID in your payment app.
                </p>
              </div>

              <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Enter Amount</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Find your individual card below and enter your exact share.
                </p>
              </div>

              <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-black">
                    3
                  </span>
                  <span>Mark as Paid</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Toggle your status chip to Paid once transfer is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
