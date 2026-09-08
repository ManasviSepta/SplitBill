import { FeatureItem, StepItem, TrustStatsData, SampleBillData } from "@/types";

export const APP_VERSION = "v2.4 AI";

export const STEPPER_ITEMS: StepItem[] = [
  { id: 1, stepNumber: 1, label: "Upload Receipt", active: true },
  { id: 2, stepNumber: 2, label: "Review Bill", active: false },
  { id: 3, stepNumber: 3, label: "Add People", active: false },
  { id: 4, stepNumber: 4, label: "Assign Items", active: false },
  { id: 5, stepNumber: 5, label: "Split Result", active: false },
];

export const TRUST_CHIPS = [
  { label: "No account needed" },
  { label: "Zero app download" },
  { label: "Proportional GST" },
];

export const TRUST_STATS: TrustStatsData = {
  totalSplit: "₹4.8 Cr+ Split",
  mealCount: "Processed across 95,000+ meals & gatherings",
  rating: "4.9/5 trust rating",
  avatars: [
    {
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      alt: "Priya",
    },
    {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      alt: "Rohan",
    },
    {
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      alt: "Sneha",
    },
  ],
};

export const FEATURE_CARDS: FeatureItem[] = [
  {
    id: "ai-instant-ocr",
    icon: "ocr",
    title: "AI Instant OCR",
    description:
      "Gemini 1.5 Pro reads low-light photos, skewed slips, itemized liquor/food taxes, and hand-written waiter annotations.",
    badge: {
      icon: "sparkle",
      text: "99.2% extraction accuracy",
    },
  },
  {
    id: "human-in-the-loop",
    icon: "human",
    title: "Human-in-the-Loop",
    description:
      "Confidence badges (Green, Amber, Red) highlight low-certainty items so your group can verify blurry prices in 1 tap.",
    badge: {
      icon: "crop",
      text: "Inline receipt crop preview",
    },
  },
  {
    id: "proportional-gst",
    icon: "tax",
    title: "Proportional GST",
    description:
      "Mathematically sound tax & promo distribution. Someone who only drank soda never pays wine vat or 10% service charge.",
    badge: {
      icon: "ledger",
      text: "Exact ₹ rounded ledger",
    },
  },
];

export const PAYMENT_APPS = [
  { name: "UPI Auto-Collect", active: true },
  { name: "Google Pay", active: true },
  { name: "PhonePe", active: true },
  { name: "Paytm", active: true },
  { name: "Cash Ledger", active: true },
];

export const FOOTER_TRUST_BADGES = [
  { label: "Gemini 1.5 Pro OCR", icon: "sparkle" },
  { label: "Bank-grade Split Accuracy", icon: "shield" },
  { label: "Export to UPI / WhatsApp", icon: "export" },
];

export const SAMPLE_OLIVE_BISTRO_BILL: SampleBillData = {
  restaurant: "Olive Bistro & Kitchen",
  branch: "Cyber Hub, Gurugram",
  date: "2025-02-28",
  time: "21:30",
  subtotal: 3500,
  cgst: 87.5,
  sgst: 87.5,
  serviceCharge: 350,
  total: 4120,
  items: [
    { id: "1", name: "Wood-Fired Truffle Funghi Pizza", quantity: 1, price: 850 },
    { id: "2", name: "Spaghetti Aglio Olio e Peperoncino", quantity: 2, price: 1100 },
    { id: "3", name: "Burrata & Heirloom Tomato Salad", quantity: 1, price: 650 },
    { id: "4", name: "Artisanal Mint Mojito", quantity: 2, price: 500 },
    { id: "5", name: "Classic Italian Tiramisu", quantity: 1, price: 400 },
  ],
};
