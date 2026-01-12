/* eslint-disable */

"use client";

import { LayoutDashboard, Users, Car, CreditCard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/server";
import { toast } from "sonner";

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("full_name,subscription_id ")
          .eq("user_id", user.id)
          .single();

        setUser({
          email: user.email,
          name: profile?.full_name || "Usuário",
          customerId: profile?.subscription_id,
        });

        setCustomerId(profile?.subscription_id || null);
      }
    };

    fetchUser();
  }, []);

  const handleOpenBillingPortal = async () => {
    if (!customerId) {
      toast.error("Erro.");
      return;
    }
    console.log("id da stripe", customerId);

    try {
      setLoadingPortal(true);

      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const data: { url?: string; error?: string } = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Erro ao criar sessão do portal.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível abrir o portal de cobrança.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/home", icon: LayoutDashboard },
    { name: "Estoque", href: "/estoque", icon: Car },
    { name: "Leads", href: "/leads", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      {/* HEADER */}
      <SidebarHeader className="bg-[#f1f1f1] dark:bg-gray-900">
        <div className="flex items-center flex-row gap-2 mt-2 px-2">
          <div className="rounded-sm flex items-center justify-center text-white">
            <Image
              src="/assets/icon.png"
              alt="Nexus Car Logo"
              width={30}
              height={30}
            />
          </div>

          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Nexus Car
            </span>
          )}
        </div>
      </SidebarHeader>

      {/* MENU PRINCIPAL */}
      <SidebarContent className=" bg-[#f1f1f1] dark:bg-gray-900">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.name}
                      className={cn(
                        "hover:bg-gray-200 dark:hover:bg-gray-800",
                        isActive(item.href) &&
                          "bg-gray-300 dark:bg-gray-800 font-medium"
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuButton
                onClick={handleOpenBillingPortal}
                disabled={!customerId || loadingPortal}
                className=" text-white bg-[#372b82] hover:bg-[#2c2166] hover:text-white"
              >
                <CreditCard className="w-5 h-5 " />
                {loadingPortal
                  ? "Abrindo portal..."
                  : customerId
                  ? "Faça upgrade do seu plano"
                  : "Sem assinatura ativa"}
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
