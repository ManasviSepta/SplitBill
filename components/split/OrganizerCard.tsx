import React, { useRef, useState } from "react";
import {
  ShieldCheck,
  Upload,
  Trash2,
  RefreshCw,
  CreditCard,
  ChevronDown,
} from "lucide-react";
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
    organizerQRImage,
    setOrganizerId,
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
      toast.error("Please upload a valid image file (PNG, JPG, JPEG, or WEBP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOrganizerQRImage(dataUrl);
      toast.success("UPI QR code uploaded successfully!");
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
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-5 sm:p-7 flex flex-col gap-6">
      {/* 1. Top Header: Bill Paid By & Payer Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
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
                <span>PAID THE RESTAURANT</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Bill Paid By
            </h2>
          </div>
        </div>

        {/* Change Payer Dropdown */}
        {participants.length > 1 && (
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
        )}
      </div>

      {/* 2. Organizer Profile & Total Paid Amount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
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
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Paid the restaurant
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5">
              Paid upfront on behalf of the group
            </span>
          </div>
        </div>

        <div className="shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-left sm:text-right shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            TOTAL AMOUNT PAID
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#16A34A] tracking-tight">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* 3. QR Upload / Large Scannable Preview Section */}
      <div className="flex flex-col items-center justify-center pt-1">
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
          /* After Upload: Large Centered Scannable QR Preview */
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-soft flex items-center justify-center">
              <img
                src={organizerQRImage}
                alt={`${activeOrganizer?.name || "Organizer"}'s UPI QR Code`}
                className="w-full max-w-[220px] sm:max-w-[250px] h-auto object-contain rounded-xl"
              />
            </div>

            {/* Small Outline Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Replace QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrganizerQRImage(null);
                  toast.info("QR code removed");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Remove QR</span>
              </button>
            </div>
          </div>
        ) : (
          /* Before Upload: Large Dashed Upload Area */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px]",
              isDragging
                ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                : "border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20"
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Upload your UPI QR code
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PNG, JPG, JPEG or WEBP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
