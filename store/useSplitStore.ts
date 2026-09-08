import { create } from "zustand";
import { BillCharges, ExtractedBillData, ReceiptItem, RestaurantInfo } from "@/types/review";
import {
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
}

export const useSplitStore = create<SplitStore>((set, get) => ({
  currentStep: 1,
  receiptImage: null,
  isUploaded: false,
  isExtracting: false,
  uploadProgress: 0,

  restaurant: MOCK_RESTAURANT,
  receiptItems: MOCK_RECEIPT_ITEMS,
  charges: MOCK_CHARGES,

  setStep: (step: number) => set({ currentStep: step }),

  setReceiptImage: (url: string | null) => set({ receiptImage: url }),

  setExtractedBill: (data: ExtractedBillData, imageUrl: string) => {
    // Map extracted items into ReceiptItem with unique IDs
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

    set({
      receiptImage: imageUrl || SAMPLE_RECEIPT_IMAGE,
      isUploaded: true,
      isExtracting: false,
      uploadProgress: 100,
      currentStep: 2,
      restaurant,
      receiptItems: mappedItems,
      charges,
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
    set({ receiptItems: get().receiptItems.filter((i) => i.id !== id) });
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
    });
  },
}));
