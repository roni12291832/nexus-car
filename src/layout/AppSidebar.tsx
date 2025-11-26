"use client";

import { LayoutDashboard, Users, Car } from "lucide-react";

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

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();

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
      <SidebarHeader className="dark:bg-gray-900">
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
      <SidebarContent className="dark:bg-gray-900">
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
