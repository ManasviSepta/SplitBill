import { create } from "zustand";
import { UploadedReceipt, SampleBillData } from "@/types";
import { SAMPLE_OLIVE_BISTRO_BILL } from "@/lib/mock-data";

interface SplitStore {
  currentStep: number;
  uploadedFiles: UploadedReceipt[];
  isExtracting: boolean;
  sampleBill: SampleBillData | null;
  setStep: (step: number) => void;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  loadSampleBill: () => void;
  clearFiles: () => void;
  startExtraction: () => void;
}

export const useSplitStore = create<SplitStore>((set, get) => ({
  currentStep: 1,
  uploadedFiles: [],
  isExtracting: false,
  sampleBill: null,

  setStep: (step: number) => set({ currentStep: step }),

  addFiles: (files: File[]) => {
    const newItems: UploadedReceipt[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      uploadedAt: new Date(),
      isSample: false,
    }));
    set({
      uploadedFiles: [...get().uploadedFiles, ...newItems].slice(0, 2),
    });
  },

  removeFile: (id: string) => {
    const file = get().uploadedFiles.find((f) => f.id === id);
    if (file && !file.isSample && file.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(file.previewUrl);
    }
    set({
      uploadedFiles: get().uploadedFiles.filter((f) => f.id !== id),
      sampleBill: file?.isSample ? null : get().sampleBill,
    });
  },

  loadSampleBill: () => {
    // Check if sample bill is already added
    const hasSample = get().uploadedFiles.some((f) => f.isSample);
    if (hasSample) return;

    const sampleReceipt: UploadedReceipt = {
      id: "sample-olive-bistro",
      name: "Olive_Bistro_Gurugram_Tax_Invoice_#4829.jpg",
      size: 482000,
      previewUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
      uploadedAt: new Date(),
      isSample: true,
    };

    set({
      uploadedFiles: [sampleReceipt],
      sampleBill: SAMPLE_OLIVE_BISTRO_BILL,
    });
  },

  clearFiles: () => {
    get().uploadedFiles.forEach((f) => {
      if (!f.isSample && f.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    set({ uploadedFiles: [], sampleBill: null });
  },

  startExtraction: () => {
    set({ isExtracting: true });
    setTimeout(() => {
      set({ isExtracting: false });
    }, 1500);
  },
}));
