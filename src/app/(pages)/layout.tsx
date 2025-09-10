"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


import "../globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/server";
import AppShell from "@/layout/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; 

    async function checkUser() {
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("ativo")
        .eq("user_id", user.id)
        .single();

      if (error || data?.ativo === false) {
        router.push("/ativar-plano");
      }
    }

    checkUser();
  }, [router, user, loading]);

  if (loading) {
    return null;
  }

  return (
    <div>
      <SidebarProvider>
        <AppShell>{children}</AppShell>
      </SidebarProvider>
    </div>
  );
}
