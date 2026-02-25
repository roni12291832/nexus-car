"use client";

import { ReactNode } from "react";


import { useIsMobile } from "@/hooks/use-mobile";

import AppSidebar from "./AppSidebar";
import Navbar from "./NavBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (

    <div className="min-h-screen bg-[#f1f1f1] flex w-full dark:bg-gray-900">
      {!isMobile && <AppSidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>

  );
}
