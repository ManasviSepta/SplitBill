import { create } from "zustand";
import { BillCharges, ExtractedBillData, ReceiptItem, RestaurantInfo } from "@/types/review";
import { AllocationStats, Participant, ParticipantBreakdown } from "@/types/people";
import {
  DEFAULT_ASSIGNMENTS,
  DEFAULT_PARTICIPANTS,
  MOCK_CHARGES,
  MOCK_RECEIPT_ITEMS,
  MOCK_RESTAURANT,
  SAMPLE_RECEIPT_IMAGE,
} from "@/lib/mock-receipt";

interface SplitStore {
  // Navigation & Flow
  currentStep: number;
  setStep: (step: number) => void;

  // Receipt & Upload State
  receiptImage: string | null;
  isUploaded: boolean;
  isExtracting: boolean;
  uploadProgress: number;

  // Bill Data
  restaurant: RestaurantInfo;
  receiptItems: ReceiptItem[];
  charges: BillCharges;

  // Participants & Assignments State
  participants: Participant[];
  assignments: Record<string, string[]>; // itemId -> participantIds[]
  selectedParticipantFilter: string | null;
  itemFilter: "all" | "assigned" | "unassigned" | "shared";

  // Actions
  setReceiptImage: (url: string | null) => void;
  setExtractedBill: (data: ExtractedBillData, imageUrl: string) => void;
  updateItemQuantity: (id: string, delta: number) => void;
  updateItemPrice: (id: string, newPrice: number) => void;
  updateItemName: (id: string, newName: string) => void;
  addItem: (item: Partial<ReceiptItem>) => void;
  removeItem: (id: string) => void;
  recalculateCharges: () => void;
  resetReceipt: () => void;

  // People & Assignment Actions
  addParticipant: (name: string, color?: string) => boolean;
  removeParticipant: (id: string) => void;
  clearParticipants: () => void;
  toggleItemParticipant: (itemId: string, participantId: string) => void;
  assignAllToItem: (itemId: string) => void;
  clearItemAssignments: (itemId: string) => void;
  setSelectedParticipantFilter: (id: string | null) => void;
  setItemFilter: (filter: "all" | "assigned" | "unassigned" | "shared") => void;

  // Computed Selectors
  getParticipantBreakdown: () => ParticipantBreakdown[];
  getAllocationStats: () => AllocationStats;
}

const PASTEL_COLORS = [
  "#16A34A", // Emerald
  "#3B82F6", // Blue
  "#EF4444", // Red/Coral
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
];

export const useSplitStore = create<SplitStore>((set, get) => ({
  currentStep: 1,
  receiptImage: null,
  isUploaded: false,
  isExtracting: false,
  uploadProgress: 0,

  restaurant: MOCK_RESTAURANT,
  receiptItems: MOCK_RECEIPT_ITEMS,
  charges: MOCK_CHARGES,

  participants: [],
  assignments: {},
  selectedParticipantFilter: null,
  itemFilter: "all",

  setStep: (step: number) => set({ currentStep: step }),

  setReceiptImage: (url: string | null) => set({ receiptImage: url }),

  setExtractedBill: (data: ExtractedBillData, imageUrl: string) => {
    const mappedItems: ReceiptItem[] = (data.items || []).map((item, idx) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      name: item.name,
      category: item.category || "Mains",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      confidence: item.confidence,
      confidenceScore:
        item.confidenceScore ||
        (item.confidence === "high" ? 98 : item.confidence === "med" ? 85 : 72),
      flagged: item.confidence !== "high",
    }));

    const computedSubtotal = mappedItems.reduce((acc, i) => acc + i.totalPrice, 0);
    const subtotal = data.subtotal > 0 ? data.subtotal : computedSubtotal;

    const gstAmount = data.gst || 0;
    const serviceFeeAmount = data.serviceCharge || 0;
    const discountAmount = data.discount || 0;

    const computedGrandTotal = Number(
      (subtotal + gstAmount + serviceFeeAmount - discountAmount).toFixed(2)
    );
    const receiptPrintedTotal = data.total > 0 ? data.total : computedGrandTotal;

    const diff = Math.abs(computedGrandTotal - receiptPrintedTotal);
    const hasDiscrepancy = diff > 1.0;
    const discrepancyWarning = hasDiscrepancy
      ? "Total recalculated from receipt. Please review highlighted values."
      : null;

    const gstRate = subtotal > 0 ? Number(((gstAmount / subtotal) * 100).toFixed(1)) : 5.0;
    const cgstRate = Number((gstRate / 2).toFixed(1));
    const sgstRate = Number((gstRate / 2).toFixed(1));
    const serviceFeeRate =
      subtotal > 0 ? Number(((serviceFeeAmount / subtotal) * 100).toFixed(1)) : 0;
    const discountRate =
      subtotal > 0 ? Number(((discountAmount / subtotal) * 100).toFixed(1)) : 0;

    const charges: BillCharges = {
      subtotal,
      gstRate,
      gstAmount,
      cgstRate,
      sgstRate,
      serviceFeeRate,
      serviceFeeAmount,
      discountRate,
      discountLabel: discountAmount > 0 ? "Receipt Discount" : "Discount",
      discountAmount,
      grandTotal: computedGrandTotal,
      originalReceiptTotal: receiptPrintedTotal,
      hasDiscrepancy,
      discrepancyWarning,
    };

    const restaurant: RestaurantInfo = {
      name: data.restaurantName || "Restaurant Receipt",
      location: data.location || "Dine-in",
      timestamp:
        [data.date, data.time].filter(Boolean).join(" • ") ||
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      billNumber: data.billNumber || `#REC-${Date.now().toString().slice(-5)}`,
      ocrAccuracy: data.ocrAccuracy || "98.8%",
    };

    // Initialize default assignment for newly extracted items (assign first 2-3 participants or unassigned)
    const newAssignments: Record<string, string[]> = {};
    const defaultDiners = get().participants.slice(0, 3).map((p) => p.id);
    mappedItems.forEach((item, idx) => {
      // Split first item among diners, leave others ready to assign
      if (idx === 0) {
        newAssignments[item.id] = defaultDiners;
      } else {
        newAssignments[item.id] = [];
      }
    });

    set({
      receiptImage: imageUrl || SAMPLE_RECEIPT_IMAGE,
      isUploaded: true,
      isExtracting: false,
      uploadProgress: 100,
      currentStep: 2,
      restaurant,
      receiptItems: mappedItems,
      charges,
      assignments: newAssignments,
    });
  },

  updateItemQuantity: (id: string, delta: number) => {
    const updated = get().receiptItems.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          totalPrice: Number((newQty * item.unitPrice).toFixed(2)),
          edited: true,
        };
      }
      return item;
    });

    set({ receiptItems: updated });
    get().recalculateCharges();
  },

  updateItemPrice: (id: string, newPrice: number) => {
    const safePrice = Math.max(0, newPrice);
    const updated = get().receiptItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          unitPrice: safePrice,
          totalPrice: Number((item.quantity * safePrice).toFixed(2)),
          edited: true,
        };
      }
      return item;
    });

    set({ receiptItems: updated });
    get().recalculateCharges();
  },

  updateItemName: (id: string, newName: string) => {
    const updated = get().receiptItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          name: newName,
          edited: true,
        };
      }
      return item;
    });

    set({ receiptItems: updated });
  },

  addItem: (itemData: Partial<ReceiptItem>) => {
    const unitPrice = itemData.unitPrice || 100;
    const quantity = itemData.quantity || 1;
    const newItem: ReceiptItem = {
      id: `item-${Date.now()}`,
      name: itemData.name || "Custom Item",
      category: itemData.category || "Mains",
      quantity,
      unitPrice,
      totalPrice: Number((quantity * unitPrice).toFixed(2)),
      confidence: "high",
      confidenceScore: 99,
      edited: true,
    };

    set({ receiptItems: [...get().receiptItems, newItem] });
    get().recalculateCharges();
  },

  removeItem: (id: string) => {
    const newItems = get().receiptItems.filter((i) => i.id !== id);
    const newAssignments = { ...get().assignments };
    delete newAssignments[id];
    set({ receiptItems: newItems, assignments: newAssignments });
    get().recalculateCharges();
  },

  recalculateCharges: () => {
    const items = get().receiptItems;
    const subtotal = Number(
      items.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2)
    );

    const currentCharges = get().charges;
    const gstAmount = Number(((subtotal * currentCharges.gstRate) / 100).toFixed(2));
    const serviceFeeAmount = Number(
      ((subtotal * currentCharges.serviceFeeRate) / 100).toFixed(2)
    );
    const discountAmount = Number(
      ((subtotal * currentCharges.discountRate) / 100).toFixed(2)
    );
    const grandTotal = Number(
      (subtotal + gstAmount + serviceFeeAmount - discountAmount).toFixed(2)
    );

    set({
      charges: {
        ...currentCharges,
        subtotal,
        gstAmount,
        serviceFeeAmount,
        discountAmount,
        grandTotal,
      },
    });
  },

  resetReceipt: () => {
    set({
      currentStep: 1,
      receiptImage: null,
      isUploaded: false,
      isExtracting: false,
      uploadProgress: 0,
      participants: [],
      assignments: {},
      selectedParticipantFilter: null,
    });
  },

  // ---------------- PEOPLE & ASSIGNMENT ACTIONS ---------------- //

  addParticipant: (name: string, color?: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    // Case-insensitive duplicate check
    const isDuplicate = get().participants.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) return false;

    const parts = trimmed.split(/\s+/).filter(Boolean);
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : trimmed.slice(0, 2).toUpperCase();

    const colorToUse =
      color || PASTEL_COLORS[get().participants.length % PASTEL_COLORS.length];

    const newParticipant: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      color: colorToUse,
      avatarColor: colorToUse,
      avatarInitials: initials,
      initials: initials,
      isYou: get().participants.length === 0,
    };

    set({ participants: [...get().participants, newParticipant] });
    return true;
  },

  removeParticipant: (id: string) => {
    // Remove participant from diner list and from all item assignments
    const updatedParticipants = get().participants.filter((p) => p.id !== id);
    const updatedAssignments: Record<string, string[]> = {};

    Object.entries(get().assignments).forEach(([itemId, diners]) => {
      updatedAssignments[itemId] = diners.filter((dId) => dId !== id);
    });

    set({
      participants: updatedParticipants,
      assignments: updatedAssignments,
      selectedParticipantFilter:
        get().selectedParticipantFilter === id ? null : get().selectedParticipantFilter,
    });
  },

  clearParticipants: () => {
    set({
      participants: [],
      assignments: {},
      selectedParticipantFilter: null,
    });
  },

  toggleItemParticipant: (itemId: string, participantId: string) => {
    const current = get().assignments[itemId] || [];
    let updated: string[];

    if (current.includes(participantId)) {
      updated = current.filter((id) => id !== participantId);
    } else {
      updated = [...current, participantId];
    }

    set({
      assignments: {
        ...get().assignments,
        [itemId]: updated,
      },
    });
  },

  assignAllToItem: (itemId: string) => {
    const allIds = get().participants.map((p) => p.id);
    const current = get().assignments[itemId] || [];

    // If already all assigned, unassign all; otherwise assign everyone
    const isAll = current.length === allIds.length;
    set({
      assignments: {
        ...get().assignments,
        [itemId]: isAll ? [] : allIds,
      },
    });
  },

  clearItemAssignments: (itemId: string) => {
    set({
      assignments: {
        ...get().assignments,
        [itemId]: [],
      },
    });
  },

  setSelectedParticipantFilter: (id: string | null) =>
    set({ selectedParticipantFilter: id }),

  setItemFilter: (filter: "all" | "assigned" | "unassigned" | "shared") =>
    set({ itemFilter: filter }),

  // ---------------- COMPUTED SELECTORS ---------------- //

  getParticipantBreakdown: (): ParticipantBreakdown[] => {
    const { participants, receiptItems, assignments, charges } = get();
    const totalFoodSubtotal = charges.subtotal || 1;

    const breakdown: ParticipantBreakdown[] = participants.map((p) => {
      let foodSubtotal = 0;
      const assignedItemNames: string[] = [];

      receiptItems.forEach((item) => {
        const assignedDiners = assignments[item.id] || [];
        if (assignedDiners.includes(p.id)) {
          const numDiners = assignedDiners.length;
          const share = item.totalPrice / numDiners;
          foodSubtotal += share;
          assignedItemNames.push(item.name);
        }
      });

      // Proportional distribution of taxes, service charge, and discounts
      const ratio = totalFoodSubtotal > 0 ? foodSubtotal / totalFoodSubtotal : 0;
      const taxShare = Number((charges.gstAmount * ratio).toFixed(2));
      const serviceShare = Number((charges.serviceFeeAmount * ratio).toFixed(2));
      const discountShare = Number((charges.discountAmount * ratio).toFixed(2));
      const grandTotal = Number(
        (foodSubtotal + taxShare + serviceShare - discountShare).toFixed(2)
      );
      const percentageOfBill = Number((ratio * 100).toFixed(1));

      return {
        participantId: p.id,
        name: p.name,
        initials: p.avatarInitials,
        color: p.color,
        isYou: p.isYou,
        itemCount: assignedItemNames.length,
        itemNames: assignedItemNames,
        foodSubtotal: Number(foodSubtotal.toFixed(2)),
        taxShare,
        serviceShare,
        discountShare,
        grandTotal,
        percentageOfBill,
      };
    });

    // Sort descending by highest amount (as in screenshot)
    return breakdown.sort((a, b) => b.grandTotal - a.grandTotal);
  },

  getAllocationStats: (): AllocationStats => {
    const { receiptItems, assignments, charges } = get();
    const totalItems = receiptItems.length;

    let assignedItemsCount = 0;
    let allocatedSubtotal = 0;

    receiptItems.forEach((item) => {
      const diners = assignments[item.id] || [];
      if (diners.length > 0) {
        assignedItemsCount += 1;
        allocatedSubtotal += item.totalPrice;
      }
    });

    const unassignedItemsCount = totalItems - assignedItemsCount;
    const totalSubtotal = charges.subtotal;
    const percentageAllocated =
      totalItems > 0 ? Math.round((assignedItemsCount / totalItems) * 100) : 0;
    const isFullyAllocated = totalItems > 0 && unassignedItemsCount === 0;

    return {
      totalItems,
      assignedItemsCount,
      unassignedItemsCount,
      allocatedSubtotal: Number(allocatedSubtotal.toFixed(2)),
      totalSubtotal,
      percentageAllocated,
      isFullyAllocated,
    };
  },
}));
