import React from "react";
import { X, ZoomIn, Download } from "lucide-react";
import { SAMPLE_RECEIPT_IMAGE } from "@/lib/mock-receipt";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
}

export function ReceiptModal({ isOpen, onClose, imageUrl }: ReceiptModalProps) {
  if (!isOpen) return null;

  const displayImage = imageUrl || SAMPLE_RECEIPT_IMAGE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-900">
              Receipt Scan Preview
            </span>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60">
              OCR Original
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center min-h-[350px]">
          <img
            src={displayImage}
            alt="Scanned restaurant receipt"
            className="max-h-[65vh] w-auto rounded-xl object-contain shadow-md border border-slate-200"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>The Smoke House Grill • Bill #SHG-88219</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
