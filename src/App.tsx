import React from "react";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { UploadHero } from "@/components/upload/UploadHero";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { TrustStats } from "@/components/upload/TrustStats";
import { FeatureSection } from "@/components/upload/FeatureCard";
import { PaymentApps } from "@/components/upload/PaymentApps";
import { Footer } from "@/components/layout/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between pt-3 relative">
      {/* Subtle background dot pattern */}
      <div className="fixed inset-0 bg-grid-dots opacity-40 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* 1. Sticky Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center w-full">
          {/* 2. Hero Section */}
          <UploadHero />

          {/* 3. Upload Receipt Card */}
          <UploadDropzone />

          {/* 4. Trust Statistics Strip */}
          <TrustStats />

          {/* 5. Feature Cards */}
          <FeatureSection />

          {/* 6. Payment Apps Section */}
          <PaymentApps />
        </main>

        {/* 7. Footer */}
        <Footer />
      </div>

      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
