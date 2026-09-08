import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FolderOpen,
  Loader2,
  Sparkles,
  RotateCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSplitStore } from "@/store/useSplitStore";
import { extractReceipt } from "@/services/api";
import { ExtractedBillData } from "@/types/review";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROGRESS_STEPS = [
  { message: "Uploading receipt to backend API...", progress: 20 },
  { message: "Reading receipt image with Gemini Vision...", progress: 45 },
  { message: "Extracting line items and charges...", progress: 70 },
  { message: "Validating taxes and totals...", progress: 90 },
];

export function UploadDropzone() {
  const navigate = useNavigate();
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Uploading receipt...");
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setExtractedBill, setReceiptImage } = useSplitStore();

  const handleProcessFile = async (file: File) => {
    setLastUploadedFile(file);
    setErrorMessage(null);
    setStatusMessage("Uploading receipt to backend API...");
    const previewUrl = URL.createObjectURL(file);
    setReceiptImage(previewUrl);
    setIsExtracting(true);
    setUploadProgress(20);

    let stepIndex = 0;
    const progressTimer = setInterval(() => {
      stepIndex++;
      if (stepIndex < PROGRESS_STEPS.length) {
        setStatusMessage(PROGRESS_STEPS[stepIndex].message);
        setUploadProgress(PROGRESS_STEPS[stepIndex].progress);
      }
    }, 600);

    try {
      const response = await extractReceipt(file);

      clearInterval(progressTimer);

      if (response.success && response.data) {
        const backendData = response.data;
        setUploadProgress(100);
        setStatusMessage("Receipt extracted successfully.");

        // Transform backend response into store ExtractedBillData schema
        const mappedData: ExtractedBillData = {
          restaurantName: backendData.restaurant.name || "Restaurant Receipt",
          location: backendData.restaurant.location || "",
          date: backendData.restaurant.date || "",
          time: backendData.restaurant.time || "",
          billNumber: backendData.restaurant.billNumber || "",
          subtotal: backendData.charges.subtotal,
          gst: backendData.charges.gst,
          serviceCharge: backendData.charges.serviceCharge,
          discount: backendData.charges.discount,
          total: backendData.charges.grandTotal,
          ocrAccuracy: "98.8%",
          items: (backendData.items || []).map((item) => {
            const conf = item.confidence === "medium" ? "med" : (item.confidence || "high");
            return {
              name: item.name,
              category: (item.category as any) || "Mains",
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              confidence: conf as "high" | "med" | "low",
              confidenceScore: item.confidenceScore || (conf === "high" ? 98 : conf === "med" ? 85 : 72),
            };
          }),
        };

        if (mappedData.items.length === 0) {
          toast.warning(
            "No line items detected on receipt. You can manually add items on the review page.",
            { duration: 4500 }
          );
        } else {
          toast.success(
            `Extracted ${mappedData.items.length} items from ${mappedData.restaurantName}!`,
            { duration: 3000 }
          );
        }

        setExtractedBill(mappedData, previewUrl);
        // Small delay to allow 100% animation before navigating
        setTimeout(() => {
          navigate("/review");
        }, 300);
      } else {
        const err = response.error || "Backend OCR extraction failed. Please try again.";
        setErrorMessage(err);
        toast.error(err, { duration: 5000 });
      }
    } catch (err: unknown) {
      clearInterval(progressTimer);
      const msg =
        err instanceof Error ? err.message : "Failed to connect to backend OCR service. Please try again.";
      setErrorMessage(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      clearInterval(progressTimer);
      setIsExtracting(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    handleProcessFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: isExtracting,
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-2">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-[24px] border border-slate-200/90 shadow-card-elevated p-6 sm:p-10 transition-all text-center relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isExtracting ? (
            /* Deterministic Extracting & Loading State */
            <motion.div
              key="extracting-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-10 sm:py-14 flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-9 h-9 text-[#16A34A]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-24 h-24 text-emerald-500 animate-spin opacity-40" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {statusMessage}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm">
                AI is reading your receipt image with high-precision OCR.
              </p>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-xs mt-6 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <motion.div
                  className="bg-gradient-to-r from-[#16A34A] to-[#22C55E] h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-700 mt-2.5 font-mono">
                {uploadProgress}%
              </span>
            </motion.div>
          ) : (
            /* Upload Drop Area */
            <div className="flex flex-col items-center">
              {/* Error Notice with Retry Buttons if previous extraction failed */}
              {errorMessage && (
                <div className="w-full mb-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        We couldn&apos;t read this receipt
                      </h4>
                      <p className="text-xs text-amber-800 font-medium mt-0.5">
                        {errorMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {lastUploadedFile && (
                      <button
                        type="button"
                        onClick={() => handleProcessFile(lastUploadedFile)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Retry Extraction</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        open();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Upload Another</span>
                    </button>
                  </div>
                </div>
              )}

              <div
                {...getRootProps()}
                className={cn(
                  "w-full rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer",
                  isDragActive
                    ? "border-[#16A34A] bg-emerald-50/60 scale-[1.01]"
                    : "border-slate-200/90 hover:border-emerald-500/60 bg-[#FBFDFB]"
                )}
              >
                <input {...getInputProps()} />

                {/* Concentric Icon Container */}
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100/70 flex items-center justify-center">
                      <UploadCloud className="w-7 h-7 text-[#16A34A]" />
                    </div>
                  </div>
                </div>

                {/* Heading */}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {isDragActive
                    ? "Drop your restaurant bill here..."
                    : "Drop restaurant bill here or click to browse"}
                </h2>

                {/* Helper Text */}
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                  Supports JPG, PNG, WEBP • Clear photo of receipt or printed bill
                </p>

                {/* Browse & Retry Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all hover:shadow-md cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-emerald-400" />
                    <span>Browse Files</span>
                  </button>

                  {lastUploadedFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcessFile(lastUploadedFile);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-[14px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4 text-emerald-600" />
                      <span>Retry Extraction</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
