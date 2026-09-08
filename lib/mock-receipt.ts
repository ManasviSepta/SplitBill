import { BillCharges, ReceiptItem, RestaurantInfo } from "@/types/review";

export const MOCK_RESTAURANT: RestaurantInfo = {
  name: "The Smoke House Grill",
  location: "Koramangala 5th Block, Bengaluru",
  timestamp: "Today, 9:42 PM",
  billNumber: "#SHG-88219",
  ocrAccuracy: "98.4%",
};

export const MOCK_RECEIPT_ITEMS: ReceiptItem[] = [
  {
    id: "item-1",
    name: "Crispy Truffle Fries",
    category: "Appetizer",
    quantity: 2,
    unitPrice: 320,
    totalPrice: 640,
    confidence: "high",
    confidenceScore: 98,
  },
  {
    id: "item-2",
    name: "Woodfired Margherita Pizza",
    category: "Mains",
    quantity: 1,
    unitPrice: 550,
    totalPrice: 550,
    confidence: "high",
    confidenceScore: 96,
  },
  {
    id: "item-3",
    name: "Smoked BBQ Chicken Wings",
    category: "Appetizer",
    quantity: 2,
    unitPrice: 480,
    totalPrice: 960,
    confidence: "high",
    confidenceScore: 95,
  },
  {
    id: "item-4",
    name: "Wild Mushroom Risotto",
    category: "Mains",
    quantity: 1,
    unitPrice: 620,
    totalPrice: 620,
    confidence: "med",
    confidenceScore: 85,
    flagged: true,
  },
  {
    id: "item-5",
    name: "Peach & Basil Iced Tea",
    category: "Beverage",
    quantity: 3,
    unitPrice: 180,
    totalPrice: 540,
    confidence: "high",
    confidenceScore: 97,
  },
  {
    id: "item-6",
    name: "Artisanal Belgian Tiramisu",
    category: "Dessert",
    quantity: 2,
    unitPrice: 350,
    totalPrice: 700,
    confidence: "low",
    confidenceScore: 72,
    flagged: true,
    edited: true,
  },
  {
    id: "item-7",
    name: "Bottled Himalayan Water",
    category: "Beverage",
    quantity: 2,
    unitPrice: 55,
    totalPrice: 110,
    confidence: "high",
    confidenceScore: 99,
  },
];

export const MOCK_CHARGES: BillCharges = {
  subtotal: 4120,
  gstRate: 5.0,
  gstAmount: 206.0,
  cgstRate: 2.5,
  sgstRate: 2.5,
  serviceFeeRate: 10,
  serviceFeeAmount: 412.0,
  discountRate: 15,
  discountLabel: "15% Dineout Pay",
  discountAmount: 618.0,
  grandTotal: 4120.0,
};

export const SAMPLE_RECEIPT_IMAGE =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80";
