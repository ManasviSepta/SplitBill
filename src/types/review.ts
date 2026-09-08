export type ConfidenceLevel = "high" | "med" | "low";

export interface ReceiptItem {
  id: string;
  name: string;
  category: "Appetizer" | "Mains" | "Beverage" | "Dessert" | "Side" | "Other";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  confidence: ConfidenceLevel;
  confidenceScore: number; // e.g. 98, 85, 72
  edited?: boolean;
  flagged?: boolean;
}

export interface RestaurantInfo {
  name: string;
  location: string;
  timestamp: string;
  billNumber: string;
  ocrAccuracy: string;
}

export interface BillCharges {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  cgstRate: number;
  sgstRate: number;
  serviceFeeRate: number;
  serviceFeeAmount: number;
  discountRate: number;
  discountLabel: string;
  discountAmount: number;
  grandTotal: number;
  originalReceiptTotal?: number;
  hasDiscrepancy?: boolean;
  discrepancyWarning?: string | null;
}

export interface ExtractedItem {
  name: string;
  category?: "Appetizer" | "Mains" | "Beverage" | "Dessert" | "Side" | "Other";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  confidence: ConfidenceLevel;
  confidenceScore?: number;
}

export interface ExtractedBillData {
  restaurantName: string;
  location?: string;
  date?: string;
  time?: string;
  billNumber?: string;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  discount: number;
  total: number;
  ocrAccuracy?: string;
  items: ExtractedItem[];
}
