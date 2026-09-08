import React from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row relative">
      {/* Background Subtle Dot Pattern */}
      <div className="fixed inset-0 bg-grid-dots opacity-40 pointer-events-none z-0" />

      {/* Left Sidebar (Desktop Fixed) / Mobile Header */}
      <Sidebar />

      {/* Main Content Area: Offset by sidebar width on desktop */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen z-10 transition-all">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
