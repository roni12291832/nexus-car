"use client";

import "../globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";

import AppShell from "@/layout/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SidebarProvider>
        <AppShell>{children}</AppShell>
      </SidebarProvider>
    </div>
  );
}
