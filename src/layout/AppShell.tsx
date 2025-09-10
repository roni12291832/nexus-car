"use client";

import { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

import { Toaster } from "sonner";
import AppSidebar from "./AppSidebar";
import Navbar from "./NavBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-gray-50 flex w-full dark:bg-gray-900">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
