"use client";

import {
  LayoutDashboard,
  Users,
  Car,
  CreditCard,
  MessageSquare,
  DollarSign,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Usuário");

  useEffect(() => {
    const fetchUser = async () => {
      const supabaseClient = createClient();
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseClient
          .from("users")
          .select("full_name, subscription_id")
          .eq("user_id", user.id)
          .single();

        setUserName(profile?.full_name || "Usuário");
        setCustomerId(profile?.subscription_id || null);
      }
    };
    fetchUser();
  }, []);

  const handleOpenBillingPortal = async () => {
    if (!customerId) {
      toast.error("Sem assinatura ativa.");
      return;
    }
    try {
      setLoadingPortal(true);
      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data: { url?: string; error?: string } = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error);
      window.location.href = data.url;
    } catch {
      toast.error("Não foi possível abrir o portal.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/home", icon: LayoutDashboard },
    { name: "Estoque", href: "/estoque", icon: Car },
    { name: "CRM", href: "/leads", icon: Users },
    { name: "Conecte seu WhatsApp", href: "/whatsapp", icon: MessageSquare },
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10">
      {/* HEADER */}
      <SidebarHeader className="bg-[#0f1117] border-b border-white/10 py-4">
        <div className="flex items-center gap-3 px-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Image src="/assets/icon.png" alt="Nexus Car" width={28} height={28} className="object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-white leading-tight">Nexus Car</span>
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest text-[9px]">Painel IA 2.0</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent className="bg-[#0f1117] py-4">
        <SidebarGroup>
          <SidebarGroupContent className="px-3 mb-6">
            <button
              onClick={handleOpenBillingPortal}
              disabled={!customerId || loadingPortal}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all",
                "bg-gradient-to-r from-[#372b82] to-[#5c4eba] text-white hover:from-[#4a3ca8] hover:to-[#6d5fd1] shadow-lg shadow-primary/20",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                isCollapsed && "justify-center p-2"
              )}
            >
              <CreditCard className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate">
                  {loadingPortal ? "Abrindo..." : "Gerenciar Plano"}
                </span>
              )}
            </button>
          </SidebarGroupContent>

          {!isCollapsed && (
            <p className="px-4 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Menu</p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={cn(
                        "rounded-xl transition-all duration-200 text-white/60 hover:text-white",
                        "hover:bg-white/8",
                        active && "bg-gradient-to-r from-violet-600/30 to-blue-600/20 text-white border border-violet-500/30 shadow-sm"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 py-2.5 px-3">
                        <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", active && "text-violet-400")} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="bg-[#0f1117] border-t border-white/10 p-3">
        {!isCollapsed && (
          <div className="px-3 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-white/40 truncate">Usuário Ativo</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
