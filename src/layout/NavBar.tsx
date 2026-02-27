/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Users,
  Menu,
  Settings,
  LogOut,
  Car,
  CreditCard,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ModeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
import { supabase } from "@/lib/supabase/server";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

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
    { name: "CRM", href: "/leads", icon: Users },
    { name: "WhatsApp", href: "/whatsapp", icon: MessageSquare },
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const NavLinks = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={cn(
              "flex items-center px-3 py-2 mx-2 rounded-sm text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-[#372b82] text-white"
                : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <nav className="bg-[#f1f1f1] border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Menu */}
          <div className="flex items-center">
            {!isMobile && <SidebarTrigger className="mr-4" />}
            {isMobile && (
              <div className="flex items-center">
                <Image
                  src="/assets/icon.png"
                  alt="Nexus Car Logo"
                  width={30}
                  height={30}
                />
                <span className="ml-2 text-xl font-bold">Nexus Car</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />

            {/* Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/configuracoes">
                <Button variant="ghost" size="sm">
                  <Settings />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 dark:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile */}
            {isMobile && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[400px] dark:bg-gray-950"
                >
                  <div className="flex flex-col h-full">
                    <div className="space-y-2 flex-1 mt-12">
                      <NavLinks mobile />
                      <Button
                        onClick={handleOpenBillingPortal}
                        disabled={!customerId || loadingPortal}
                        className="mx-2 w-[70vw] bg-[#372b82]"
                      >
                        <CreditCard className="w-5 h-5 " />
                        {loadingPortal
                          ? "Abrindo portal..."
                          : customerId
                            ? "Faça upgrade do seu plano"
                            : "Sem assinatura ativa"}
                      </Button>
                    </div>

                    <div className="border-t pt-4 mt-4 ml-5 mb-5">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-[#372b82] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-medium">
                            {user?.name || "Usuário"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/configuracoes"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Configurações
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
