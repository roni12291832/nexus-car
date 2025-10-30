import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
const inter = Inter({ subsets: ["latin"] });
import { AuthProvider } from "@/contexts/AuthContext";

import { ThemeProvider } from "@/components/ThemeToggle/theme-provider";
import Script from "next/script";
import Image from "next/image";

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
      <head>
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
          !function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1608283786798294');
fbq('track', 'PageView');

          `}
        </Script>

        <noscript>
          <Image
            height="1"
            alt="pixel"
            style={{ display: "none" }}
            width="1"
            src={`https://www.facebook.com/tr?id=1608283786798294&ev=PageView&noscript=1`}
          />
        </noscript>
      </head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={cn(
          "min-h-screen  font-sans antialiased box-border",
          inter.className
        )}
      >
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
      </body>
    </html>
  );
}
