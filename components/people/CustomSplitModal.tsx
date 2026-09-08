import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { ReceiptItem } from "@/types/review";
import { Participant } from "@/types/people";
import { ParticipantAvatar } from "./ParticipantAvatar";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Custom Split</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {item.name} • ₹{item.totalPrice.toFixed(2)} total
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diners List */}
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {assignedPeople.map((p) => {
              const currentP = percentages[p.id] || 0;
              const calculatedAmount = (item.totalPrice * (currentP / 100)).toFixed(2);

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
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
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentP}
                        onChange={(e) =>
                          handlePercentageChange(p.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-12 text-right text-xs font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="text-[11px] font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-16 text-right">
                      ₹{calculatedAmount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Validation Strip */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold">
            <span>Total Allocated:</span>
            <span
              className={isValid ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}
            >
              {totalPercent.toFixed(1)}% / 100%
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Split</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
