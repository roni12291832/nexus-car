import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import SocialProof from "@/components/ProvaSocial";
import LoginForm from "./login-form";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="px-2 py-8">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-3xl font-bold leading-tight">
                Automatize sua{" "}
                <span className="bg-gradient-hero bg-clip-text text-[#372b82]">
                  concessionária
                </span>{" "}
                com IA
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Nexus Car oferece um agente virtual inteligente que conversa com seus clientes, qualifica leads e aumenta suas vendas, 24 horas por dia.
              </p>
            </div>

            <div className="hidden lg:block">
              <SocialProof />
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Ainda não conhece o Nexus Car?
              </p>
              <Link href="https://lp.nexuscar.com.br/">
                <Button
                  variant="outline"
                  className="border-primary/20 hover:border-primary hover:bg-primary/5"
                >
                  Saiba mais sobre a plataforma
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-8 order-1 lg:order-2">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>

            <div className="lg:hidden w-full max-w-md px-4">
              <SocialProof />
            </div>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-border/50 dark:border-gray-400">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                <Link href="/termos-de-uso" className="hover:text-primary">
                  Termos de uso
                </Link>
                <a
                  href="/politica-de-privacidade"
                  className="hover:text-primary"
                >
                  Política de privacidade
                </a>
                <a href="#" className="hover:text-primary">
                  Suporte
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 Nexus Car. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
