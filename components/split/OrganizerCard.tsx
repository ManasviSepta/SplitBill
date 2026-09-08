import React, { useRef, useState } from "react";
import {
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  CreditCard,
  QrCode,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { Participant } from "@/types/people";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { useSplitStore } from "@/store/useSplitStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrganizerCardProps {
  grandTotal: number;
}

export function OrganizerCard({ grandTotal }: OrganizerCardProps) {
  const {
    participants,
    organizerId,
    organizerUPI,
    organizerQRImage,
    setOrganizerId,
    setOrganizerUPI,
    setOrganizerQRImage,
  } = useSplitStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Active organizer participant
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

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, or WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOrganizerQRImage(dataUrl);
      toast.success("Organizer UPI QR code uploaded successfully!");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-6 sm:p-7 flex flex-col gap-6">
      {/* Top Header: Bill Paid By */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PRIMARY COLLECTOR
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>PAID RESTAURANT</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Bill Paid By
            </h2>
          </div>
        </div>

        {/* Organizer Selector */}
        {participants.length > 1 ? (
          <div className="flex items-center gap-2">
            <label htmlFor="organizer-select" className="text-xs font-semibold text-slate-500">
              Change Payer:
            </label>
            <div className="relative inline-block">
              <select
                id="organizer-select"
                value={activeOrganizer?.id || ""}
                onChange={(e) => setOrganizerId(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isYou ? "(You)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ) : null}
      </div>

      {/* Organizer Profile & Amount Paid Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/70">
        <div className="flex items-center gap-3.5 min-w-0">
          {activeOrganizer && (
            <ParticipantAvatar
              initials={activeOrganizer.avatarInitials}
              avatarColor={activeOrganizer.color}
              size="lg"
            />
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                {activeOrganizer?.name || "Organizer"}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                Bill Owner
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5">
              Paid the total restaurant invoice upfront on behalf of the group
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0 bg-white border border-emerald-200/80 rounded-xl px-4 py-2 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            TOTAL AMOUNT PAID
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#16A34A] tracking-tight">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Organizer UPI ID & QR Code Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Left: Organizer UPI ID Input */}
        <div className="flex flex-col justify-between gap-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Organizer UPI ID (VPA)
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Enter your UPI ID so participants can send funds directly to your bank account.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder={
                activeOrganizer
                  ? `${activeOrganizer.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@oksbi`
                  : "yourname@okhdfcbank"
              }
              value={organizerUPI}
              onChange={(e) => setOrganizerUPI(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
            />
            <span className="text-[11px] text-slate-400">
              Supported: Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay
            </span>
          </div>
        </div>

        {/* Right: QR Code Drag & Drop Upload */}
        <div className="flex flex-col gap-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Upload Collector UPI QR Code
              </h3>
            </div>

            {organizerQRImage && (
              <span className="text-[10px] font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Active QR
              </span>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />

          {organizerQRImage ? (
            /* Uploaded QR Preview */
            <div className="flex items-center gap-4 bg-white border border-emerald-200 rounded-xl p-3 shadow-2xs">
              <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                <img
                  src={organizerQRImage}
                  alt="Organizer UPI QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  Personal UPI QR Ready
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Displayed below for diners to scan
                </span>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrganizerQRImage(null);
                      toast.info("QR code removed");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[100px]",
                isDragging
                  ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                  : "border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/20"
              )}
            >
              <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
              <p className="text-xs font-bold text-slate-700">
                Click or drag &amp; drop UPI QR image
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, or WEBP (Max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
