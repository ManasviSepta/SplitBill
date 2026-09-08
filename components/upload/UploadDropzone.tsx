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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSplitStore } from "@/store/useSplitStore";
import { extractBillWithGemini } from "@/lib/gemini";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UploadDropzone() {
  const navigate = useNavigate();
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Reading receipt...");
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setExtractedBill, setReceiptImage } = useSplitStore();

  const handleProcessFile = async (file: File) => {
    setLastUploadedFile(file);
    setErrorMessage(null);
    setStatusMessage("Reading receipt...");
    const previewUrl = URL.createObjectURL(file);
    setReceiptImage(previewUrl);
    setIsExtracting(true);
    setUploadProgress(20);

    toast.info("Uploading receipt image...", { duration: 1500 });

    // Progress bar simulation
    const timer = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 12 : prev));
    }, 450);

    try {
      const result = await extractBillWithGemini(file, (msg) => {
        setStatusMessage(msg);
      });

      clearInterval(timer);

      if (result.success && result.data) {
        setUploadProgress(100);
        setStatusMessage("Receipt extracted successfully.");

        if (result.data.items.length === 0) {
          toast.warning(
            "No line items detected on receipt. You can manually add items on the review page.",
            { duration: 4500 }
          );
        } else {
          toast.success(
            `Extracted ${result.data.items.length} items from ${result.data.restaurantName}!`,
            { duration: 3000 }
          );
        }

        setExtractedBill(result.data, previewUrl);
        navigate("/review");
      } else {
        const err =
          result.error ||
          "We couldn't reach the AI service right now. Please try again in a few seconds.";
        setErrorMessage(err);
        toast.error(err, { duration: 5000 });
      }
    } catch (err: unknown) {
      clearInterval(timer);
      const msg =
        err instanceof Error ? err.message : "We couldn't reach the AI service right now. Please try again in a few seconds.";
      setErrorMessage(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      // Ensure UI is never left stuck in loading state
      clearInterval(timer);
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
            /* Extracting & Loading State with Dynamic Status Messages */
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
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                Analyzing line items, quantities, taxes, and service charges.
              </p>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-xs mt-6 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <motion.div
                  className="bg-gradient-to-r from-[#16A34A] to-[#22C55E] h-full rounded-full"
                  initial={{ width: "20%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-700 mt-2">
                Processing receipt...
              </span>
            </motion.div>
          ) : (
            /* Upload Drop Area */
            <div className="flex flex-col items-center">
              {/* Error Notice with Retry Button if previous extraction failed */}
              {errorMessage && (
                <div className="w-full mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        Extraction Incomplete
                      </h4>
                      <p className="text-xs text-amber-800 font-medium mt-0.5">
                        {errorMessage}
                      </p>
                    </div>
                  </div>

                  {lastUploadedFile && (
                    <button
                      type="button"
                      onClick={() => handleProcessFile(lastUploadedFile)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer self-end sm:self-center"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retry Extraction</span>
                    </button>
                  )}
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
