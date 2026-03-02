import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import SocialProof from "@/components/ProvaSocial";
import LoginForm from "./login-form";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#050608] relative overflow-hidden selection:bg-violet-500/20 selection:text-violet-200 antialiased">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-fuchsia-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-center mb-12">
          <div className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <Logo />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center max-w-7xl mx-auto">
          <div className="space-y-12 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1] text-white">
                Venda mais com{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                  Inteligência Artificial
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                O Nexus Car é a plataforma definitiva para transformar conversas em vendas reais.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="p-1 px-4 py-6 bg-white/[0.03] backdrop-blur-sm rounded-[32px] border border-white/5 shadow-inner">
                <SocialProof />
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 lg:border-none">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">
                Explore o ecossistema Nexus
              </p>
              <Link href="https://lp.nexuscar.com.br/">
                <Button
                  variant="ghost"
                  size="lg"
                  className="bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl h-14 px-10 font-bold transition-all group"
                >
                  <span className="group-hover:translate-x-1 transition-transform inline-block font-medium text-slate-300">Conheça nossa tecnologia</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center order-1 lg:order-2">
            <div className="w-full max-w-[460px]">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <LoginForm />
                </div>
              </div>
            </div>

            <div className="lg:hidden w-full max-w-[460px] mt-12">
              <div className="p-6 bg-white/[0.03] backdrop-blur-sm rounded-[32px] border border-white/5 shadow-inner">
                <SocialProof />
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-8 text-[13px] font-medium text-slate-500">
              <Link href="/termos-de-uso" className="hover:text-violet-400 transition-colors">Termos de uso</Link>
              <Link href="/politica-de-privacidade" className="hover:text-violet-400 transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-violet-400 transition-colors">Suporte Técnico</Link>
            </div>
            <p className="text-[13px] text-slate-600 font-medium">
              © 2025 Nexus Car. Engineering for the future of automotive sales.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
