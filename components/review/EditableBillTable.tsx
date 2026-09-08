import React, { useState } from "react";
import {
  PlusCircle,
  SlidersHorizontal,
  Minus,
  Plus,
  Trash2,
  Edit2,
  Info,
  Pizza,
  UtensilsCrossed,
  GlassWater,
  CupSoda,
  Cake,
  Check,
} from "lucide-react";
import { ReceiptItem } from "@/types/review";
import { ConfidenceBadge, ConfidenceLegend } from "./ConfidenceBadge";
import { useSplitStore } from "@/store/useSplitStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableBillTableProps {
  items: ReceiptItem[];
  tableRef?: React.RefObject<HTMLDivElement | null>;
}

export function EditableBillTable({ items, tableRef }: EditableBillTableProps) {
  const { updateItemQuantity, updateItemPrice, updateItemName, addItem, removeItem } =
    useSplitStore();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("250");
  const [newItemCategory, setNewItemCategory] = useState<ReceiptItem["category"]>("Mains");

  const getItemIcon = (category: string, name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("pizza")) return <Pizza className="w-4 h-4 text-emerald-600" />;
    if (lower.includes("tea") || lower.includes("soda") || lower.includes("beverage") || lower.includes("coffee") || lower.includes("juice") || lower.includes("beer"))
      return <CupSoda className="w-4 h-4 text-emerald-600" />;
    if (lower.includes("water")) return <GlassWater className="w-4 h-4 text-blue-500" />;
    if (lower.includes("dessert") || lower.includes("cake") || lower.includes("tiramisu") || lower.includes("ice cream"))
      return <Cake className="w-4 h-4 text-rose-500" />;
    return <UtensilsCrossed className="w-4 h-4 text-slate-500" />;
  };

  const handleStartEditName = (item: ReceiptItem) => {
    setEditingItemId(item.id);
    setTempName(item.name);
  };

  const handleSaveName = (id: string) => {
    if (tempName.trim()) {
      updateItemName(id, tempName.trim());
      toast.success("Updated item name");
    }
    setEditingItemId(null);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      toast.error("Please provide an item name");
      return;
    }
    const price = parseFloat(newItemPrice) || 0;
    addItem({
      name: newItemName.trim(),
      unitPrice: price,
      category: newItemCategory,
      quantity: 1,
    });
    toast.success(`Added ${newItemName} to the bill`);
    setNewItemName("");
    setNewItemPrice("250");
    setShowAddModal(false);
  };

  return (
    <div
      ref={tableRef}
      className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft overflow-hidden mt-6"
    >
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-[13px] font-bold text-slate-800 shadow-2xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#16A34A]" />
            <span>Add Missing Item</span>
          </button>

          <button
            type="button"
            onClick={() =>
              toast.info("Taxes & discounts are auto-calculated from extracted receipt values.")
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-[13px] font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Adjust Charges</span>
          </button>
        </div>

        {/* Confidence Legend */}
        <div className="shrink-0">
          <ConfidenceLegend />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 sm:px-6">ITEM DESCRIPTION</th>
              <th className="py-3 px-3">CATEGORY</th>
              <th className="py-3 px-3 text-center">QTY</th>
              <th className="py-3 px-3 text-right">UNIT PRICE</th>
              <th className="py-3 px-4 sm:px-5 text-right">TOTAL</th>
              <th className="py-3 px-4 sm:px-6 text-center">CONFIDENCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                  No items detected. Click &quot;Add Missing Item&quot; to add dishes manually.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isFlagged = item.flagged;

                return (
                  <tr
                    key={item.id}
                    id={`row-${item.id}`}
                    className={cn(
                      "transition-colors group",
                      isFlagged && item.confidence === "med"
                        ? "bg-amber-50/40 hover:bg-amber-50/60"
                        : isFlagged && item.confidence === "low"
                        ? "bg-rose-50/40 hover:bg-rose-50/60"
                        : "hover:bg-slate-50/70"
                    )}
                  >
                    {/* Item Description */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {getItemIcon(item.category, item.name)}
                        </div>

                        <div className="flex flex-col min-w-0">
                          {editingItemId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="px-2 py-1 text-xs border border-emerald-400 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleSaveName(item.id)}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveName(item.id)}
                                className="p-1 bg-[#16A34A] text-white text-xs font-bold rounded-md"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 tracking-tight">
                                {item.name}
                              </span>
                              {item.edited && (
                                <span className="text-[10px] text-rose-600 italic font-medium">
                                  (Edited)
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleStartEditName(item)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5 transition-opacity"
                                title="Edit item name"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                        {item.category}
                      </span>
                    </td>

                    {/* Quantity Stepper */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200/70 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center font-bold text-xs text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Unit Price (Editable) */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <span className="text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItemPrice(item.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-right font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-emerald-500 focus:border-emerald-600 focus:outline-none text-xs sm:text-sm py-0.5"
                        />
                      </div>
                    </td>

                    {/* Total Price & Delete */}
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <span className="font-extrabold text-slate-900">
                          ₹{item.totalPrice.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.id);
                            toast.info(`Removed ${item.name}`);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1 cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Confidence Column */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <ConfidenceBadge
                        level={item.confidence}
                        score={item.confidenceScore}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Helper */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Items can be individually split or shared evenly in the next step.</span>
        </div>
        <div className="font-medium text-slate-600">
          Auto-detected Currency: <span className="font-bold text-slate-900">INR (₹)</span>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleAddNewItem}
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 flex flex-col gap-4"
          >
            <h3 className="font-extrabold text-base text-slate-900">Add Missing Item</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Item Name</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Garlic Bread"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) =>
                    setNewItemCategory(e.target.value as ReceiptItem["category"])
                  }
                  className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="Appetizer">Appetizer</option>
                  <option value="Mains">Mains</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Side">Side</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#16A34A] text-white hover:bg-[#15803D]"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
