export interface StepItem {
  id: number;
  label: string;
  stepNumber: number;
  active: boolean;
  completed?: boolean;
}

export interface FeatureItem {
  id: string;
  icon: "ocr" | "human" | "tax";
  title: string;
  description: string;
  badge: {
    icon: "sparkle" | "crop" | "ledger";
    text: string;
  };
}

export interface TrustStatsData {
  totalSplit: string;
  mealCount: string;
  rating: string;
  avatars: {
    src: string;
    alt: string;
  }[];
}

export interface UploadedReceipt {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  uploadedAt: Date;
  isSample?: boolean;
  file?: File;
}

export interface SampleReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface SampleBillData {
  restaurant: string;
  branch: string;
  date: string;
  time: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  total: number;
  items: SampleReceiptItem[];
}
