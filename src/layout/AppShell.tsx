"use client";

import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "./AppSidebar";
import Navbar from "./NavBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full bg-[#0a0b0f]">
      {!isMobile && <AppSidebar />}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0b0f]">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
