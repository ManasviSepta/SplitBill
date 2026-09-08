import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RestaurantHeader } from "@/components/review/RestaurantHeader";
import { ReviewBanner } from "@/components/review/ReviewBanner";
import { BillSummaryCards } from "@/components/review/BillSummaryCards";
import { EditableBillTable } from "@/components/review/EditableBillTable";
import { StickyReviewFooter } from "@/components/review/StickyReviewFooter";
import { ReceiptModal } from "@/components/review/ReceiptModal";
import { useSplitStore } from "@/store/useSplitStore";

import { useNavigate } from "react-router-dom";

export function ReviewPage() {
  const navigate = useNavigate();
  const {
    restaurant,
    receiptItems,
    charges,
    receiptImage,
    isUploaded,
    setStep,
  } = useSplitStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isUploaded || receiptItems.length === 0) {
      navigate("/");
      return;
    }
    setStep(2);
  }, [isUploaded, receiptItems.length, navigate, setStep]);

  const flaggedItems = receiptItems.filter(
    (item) => item.flagged || item.confidence !== "high"
  );

  const handleJumpToRow = (targetId?: string) => {
    const idToFind = targetId || flaggedItems[0]?.id;
    if (!idToFind) return;

    const row = document.getElementById(`row-${idToFind}`);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("ring-2", "ring-amber-400");
      setTimeout(() => {
        row.classList.remove("ring-2", "ring-amber-400");
      }, 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* 1. Restaurant Header */}
      <RestaurantHeader
        restaurant={restaurant}
        onViewScan={() => setIsModalOpen(true)}
      />

      {/* 2. Review Notice Banner (Dynamic flagged confidence + recalculation notice) */}
      <ReviewBanner
        flaggedItems={flaggedItems}
        hasDiscrepancy={charges.hasDiscrepancy}
        discrepancyWarning={charges.discrepancyWarning}
        onJumpToRow={handleJumpToRow}
      />

      {/* 3. Bill Summary Cards (Subtotal, GST, Service, Discount, Grand Total) */}
      <BillSummaryCards charges={charges} itemCount={receiptItems.length} />

      {/* 4. Editable Bill Table */}
      <EditableBillTable items={receiptItems} tableRef={tableRef} />

      {/* 5. Sticky Bottom Action Bar */}
      <StickyReviewFooter
        itemCount={receiptItems.length}
        grandTotal={charges.grandTotal}
      />

      {/* 6. Receipt Scan Modal */}
      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={receiptImage}
      />
    </motion.div>
  );
}
