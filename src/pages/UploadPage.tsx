import React, { useEffect } from "react";
import { UploadHero } from "@/components/upload/UploadHero";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { PaymentApps } from "@/components/upload/PaymentApps";
import { useSplitStore } from "@/store/useSplitStore";

export function UploadPage() {
  const setStep = useSplitStore((state) => state.setStep);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* 1. Hero Section (Cleaned, starting with 'Split the bill. Not the friendship.') */}
      <UploadHero />

      {/* 2. Upload Receipt Dropzone (Simulated upload & 2s OCR extraction) */}
      <UploadDropzone />

      {/* 3. Payment Apps Ecosystem */}
      <PaymentApps />
    </div>
  );
}
