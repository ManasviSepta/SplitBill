import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { UploadPage } from "./pages/UploadPage";
import { ReviewPage } from "./pages/ReviewPage";
import { PeoplePage } from "./pages/PeoplePage";
import { AssignItemsPage } from "./pages/AssignItemsPage";
import { SplitPage } from "./pages/SplitPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/assign-items" element={<AssignItemsPage />} />
          <Route path="/assign" element={<Navigate to="/assign-items" replace />} />
          <Route path="/split" element={<SplitPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  );
}
