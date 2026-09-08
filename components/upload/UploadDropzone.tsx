import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FolderOpen,
  ArrowRight,
  Receipt,
  Trash2,
  CheckCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { GradientButton } from "@/components/shared/GradientButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UploadDropzone() {
  const {
    uploadedFiles,
    isExtracting,
    addFiles,
    removeFile,
    loadSampleBill,
    startExtraction,
    setStep,
  } = useSplitStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (uploadedFiles.length + acceptedFiles.length > 2) {
        toast.warning("Up to 2 receipts allowed (multi-page/bar tab).");
      }
      addFiles(acceptedFiles);
      toast.success(
        `Added ${acceptedFiles.length} file${
          acceptedFiles.length > 1 ? "s" : ""
        } for processing!`
      );
    },
    [addFiles, uploadedFiles.length]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 2,
    noClick: uploadedFiles.length > 0, // Click inside browse button or drag
  });

  const handleSampleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    loadSampleBill();
    toast.success("Loaded sample Olive Bistro bill (₹4,120) with 5 itemized dishes!");
  };

  const handleExtract = () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please drop a bill receipt or click the sample bill to test.");
      return;
    }

    startExtraction();
    toast.info("Gemini 1.5 Pro is reading items, prices, GST & service charges...", {
      duration: 2000,
    });

    setTimeout(() => {
      toast.success("Receipt parsed with 99.2% confidence! Ready for Review.", {
        duration: 3000,
      });
      // Advance to Review Bill step
      setStep(2);
    }, 1800);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="bg-white rounded-[24px] border border-slate-200/90 shadow-card-elevated p-6 sm:p-10 transition-all text-center"
      >
        {/* Drop Area */}
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed transition-all duration-200 p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer",
            isDragActive
              ? "border-[#16A34A] bg-emerald-50/50 scale-[1.01]"
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
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500 font-medium">
            Supports JPG, PNG, WEBP • Up to 2 receipts (multi-page/bar tab)
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 w-full sm:w-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-sm font-semibold border border-slate-200 transition-colors cursor-pointer shadow-xs"
            >
              <FolderOpen className="w-4 h-4 text-slate-600" />
              <span>Browse Files</span>
            </button>

            <GradientButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleExtract();
              }}
              isLoading={isExtracting}
              className="w-full sm:w-auto"
            >
              <span>Extract Bill with Gemini AI</span>
              <ArrowRight className="w-4 h-4" />
            </GradientButton>
          </div>

          {/* Sample Receipt Link */}
          <button
            type="button"
            onClick={handleSampleClick}
            className="mt-6 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-[#16A34A] hover:text-[#15803D] hover:underline transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Or test with a sample Olive Bistro bill</span>
          </button>
        </div>

        {/* Uploaded Files Preview List */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-left"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ready to Parse ({uploadedFiles.length}/2)
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Image Ready
                </span>
              </div>

              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {file.name}
                        </span>
                        {file.isSample && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-xs shrink-0">
                            SAMPLE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                      toast.info("Removed bill image.");
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
