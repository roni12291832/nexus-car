"use client";

import { useState } from "react";
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
  CreditCard,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { ModeToggle } from "@/components/ThemeToggle";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/home", icon: LayoutDashboard },
    { name: "Estoque", href: "/estoque", icon: Car },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Plano & Cobrança", href: "/plano-cobranca", icon: CreditCard },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

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
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-blue-100 text-blue-900 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {!isMobile && <SidebarTrigger className="mr-4" />}

            {isMobile && (
              <div className="flex-shrink-0 flex items-center">
                <div className=" flex items-center justify-center">
                  <Image
                    src="/assets/icon.png"
                    alt="Nexus Car Logo"
                    width="30"
                    height="30"
                  />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Nexus Car
                </span>
              </div>
            )}
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Link href="/configuracoes">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-white"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>

            <div className="hidden md:flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#372b82] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Menu mobile */}
            {isMobile && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="space-y-2 flex-1 mt-12">
                      <NavLinks mobile />
                    </div>

                    <div className="border-t pt-4 mt-4 ml-5 mb-5">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">U</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Usuário
                          </p>
                          <p className="text-xs text-gray-500">
                            usuario@email.com
                          </p>
                        </div>
                      </div>
                      <Link href="/settings" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-600 hover:text-gray-900"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Configurações
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-600 hover:text-gray-900"
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
