import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
const inter = Inter({ subsets: ["latin"] });
import { AuthProvider } from "@/contexts/AuthContext";

import { ThemeProvider } from "@/components/ThemeToggle/theme-provider";
import Script from "next/script";
import Image from "next/image";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Nexus Car - Atendimento por IA para sua Loja de Veículos",
  description:
    "O Nexus Car é um SaaS inovador que oferece um agente de atendimento por inteligência artificial para sua loja de veículos. Automatize conversas, melhore a experiência do cliente e aumente suas vendas com tecnologia de ponta.",
  keywords: [
    "nexus car",
    "atendimento por IA",
    "loja de veículos",
    "concessionária digital",
    "assistente virtual",
    "chatbot para concessionária",
    "vendas de carros",
    "automação de atendimento",
    "inteligência artificial para vendas",
    "tecnologia automotiva",
    "experiência do cliente",
    "atendimento 24/7",
    "suporte automatizado",
    "gestão de leads automotivos",
    "marketing automotivo",
    "conversão de vendas",
    "saas para concessionárias",
    "plataforma de atendimento",
    "automação de negócios",
    "chat inteligente",
    "assistente de vendas",
    "carros novos e seminovos",
    "CRM automotivo",
    "inovação no setor automotivo",
    "digitalização de concessionária",
    "sistema de atendimento automotivo",
  ],
  authors: [{ name: "Nexus Car", url: "https://app.nexuscar.com.br" }],
  creator: "Nexus Car",
  metadataBase: new URL("https://app.nexuscar.com.br"),
  openGraph: {
    title: "Nexus Car - Atendimento Inteligente para Concessionárias",
    description:
      "Transforme sua concessionária com o Nexus Car: agente de atendimento por IA que melhora a comunicação e aumenta suas vendas.",
    url: "https://app.nexuscar.com.br",
    siteName: "Nexus Car",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexus Car - Atendimento por IA para Lojas de Veículos",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "l6fU930vlGP6d2Qvdmhg4NGZb-2QRAiVTBtJwmNLTMs",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={cn(
          "min-h-screen  font-sans antialiased box-border",
          inter.className,
        )}
      >
        <Toaster />
       
        <TooltipProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
