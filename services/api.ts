/**
 * SplitBill Backend API Service Client
 * Connects the React Frontend to the Python FastAPI Backend.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env as unknown as Record<string, string>).API_URL ||
  "http://localhost:8000";

export interface ApiReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  confidence?: "high" | "medium" | "low";
  confidenceScore?: number;
}

export interface ApiReceiptCharges {
  subtotal: number;
  gst: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
}

export interface ApiRestaurantInfo {
  name: string;
  date?: string;
  time?: string;
  billNumber?: string;
  location?: string;
}

export interface ApiReceiptData {
  restaurant: ApiRestaurantInfo;
  charges: ApiReceiptCharges;
  items: ApiReceiptItem[];
}

export interface ReceiptExtractApiResponse {
  success: boolean;
  data: ApiReceiptData;
  modelUsed?: string;
  error?: string;
}

export interface SplitCalculatePayload {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category?: string;
  }>;
  charges: {
    subtotal: number;
    gst: number;
    serviceCharge: number;
    discount: number;
    grandTotal: number;
  };
  participants: Array<{
    id: string;
    name: string;
    color?: string;
    avatarInitials?: string;
    isYou?: boolean;
  }>;
  assignments: Record<string, string[]>;
}

export interface ParticipantSplitResult {
  id: string;
  name: string;
  initials?: string;
  color?: string;
  isYou?: boolean;
  foodSubtotal: number;
  gstShare: number;
  serviceChargeShare: number;
  discountShare: number;
  finalAmount: number;
  items: Array<{
    itemId: string;
    name: string;
    shareFraction: string;
    shareAmount: number;
  }>;
  percentageOfBill?: number;
}

export interface SplitCalculateApiResponse {
  success: boolean;
  participants: ParticipantSplitResult[];
  allocation: {
    allocatedAmount: number;
    remainingAmount: number;
    grandTotal: number;
    isBalanced: boolean;
    totalItems: number;
    assignedItemsCount: number;
    unassignedItemsCount: number;
    percentageAllocated: number;
  };
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status: ${res.status}`);
  }
  return res.json();
}

/**
 * Upload receipt image to FastAPI backend /api/receipt/extract
 */
export async function extractReceipt(file: File): Promise<ReceiptExtractApiResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/receipt/extract`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = "Failed to extract receipt.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.detail || errorDetail;
    } catch {
      const errText = await response.text();
      errorDetail = errText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  const result: ReceiptExtractApiResponse = await response.json();
  return result;
}

/**
 * Calculate bill split using FastAPI backend /api/split/calculate
 */
export async function calculateSplit(
  payload: SplitCalculatePayload
): Promise<SplitCalculateApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/split/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = "Failed to calculate bill split.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.detail || errorDetail;
    } catch {
      const errText = await response.text();
      errorDetail = errText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  const result: SplitCalculateApiResponse = await response.json();
  return result;
}
