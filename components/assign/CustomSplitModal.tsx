import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { ReceiptItem } from "@/types/review";
import { Participant } from "@/types/people";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { toast } from "sonner";

interface CustomSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ReceiptItem;
  participants: Participant[];
  assignedParticipantIds: string[];
  onSaveShares: (shares: Record<string, number>) => void;
}

export function CustomSplitModal({
  isOpen,
  onClose,
  item,
  participants,
  assignedParticipantIds,
  onSaveShares,
}: CustomSplitModalProps) {
  if (!isOpen) return null;

  const assignedPeople = participants.filter((p) =>
    assignedParticipantIds.includes(p.id)
  );

  // Equal starting share
  const initialPercent = assignedPeople.length > 0 ? 100 / assignedPeople.length : 0;
  const [percentages, setPercentages] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    assignedPeople.forEach((p) => {
      map[p.id] = Number(initialPercent.toFixed(1));
    });
    return map;
  });

  const totalPercent = Object.values(percentages).reduce((sum, p) => sum + (Number(p) || 0), 0);
  const isValid = Math.abs(totalPercent - 100) < 0.5;

  const handlePercentageChange = (pId: string, val: number) => {
    setPercentages((prev) => ({
      ...prev,
      [pId]: val,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error(`Total percentage must equal 100% (currently ${totalPercent.toFixed(1)}%)`);
      return;
    }
    onSaveShares(percentages);
    toast.success("Custom split saved for this item!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-card-elevated border border-slate-200 max-w-md w-full p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Custom Split: {item.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Item Total: ₹{item.totalPrice.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {assignedPeople.map((p) => {
              const pct = percentages[p.id] || 0;
              const personShareAmt = ((item.totalPrice * pct) / 100).toFixed(2);

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-2.5">
                    <ParticipantAvatar
                      initials={p.avatarInitials}
                      color={p.color}
                      size="sm"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {p.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 focus-within:border-emerald-500">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={percentages[p.id] ?? ""}
                        onChange={(e) =>
                          handlePercentageChange(p.id, Number(e.target.value))
                        }
                        className="w-12 text-xs font-bold text-right focus:outline-none text-slate-800"
                      />
                      <span className="text-xs text-slate-400 ml-1">%</span>
                    </div>

                    <span className="text-xs font-bold text-slate-700 w-16 text-right">
                      ₹{personShareAmt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Status */}
          <div className="flex items-center justify-between text-xs px-2 pt-2 border-t border-slate-100">
            <span className="text-slate-500">Total Percentage:</span>
            <span
              className={`font-black ${
                isValid ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {totalPercent.toFixed(1)}% / 100%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Custom Split</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
