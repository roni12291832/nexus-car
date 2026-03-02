"use client";

import { Check, Star, LogOut, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubscribeButton from "./_componentes/button";
import Link from "next/link";

export default function PlanNotActivated() {
  return (
    <div className="min-h-screen bg-[#050608] relative overflow-hidden flex items-center justify-center p-4 antialiased">
      {/* Botão Sair */}
      <div className="absolute top-8 right-8 z-50">
        <Link href="/login">
          <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl gap-2 font-medium">
            <LogOut className="w-4 h-4" />
            Sair e voltar ao login
          </Button>
        </Link>
      </div>

      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Escolha seu <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Plano Nexus</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Ative sua conta e comece a escalar suas vendas com Inteligência Artificial hoje mesmo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="group relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-xl hover:border-white/20 transition-all duration-500 rounded-[32px] p-1">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ 97</span>
                  <span className="text-slate-500 text-sm font-medium">/mês</span>
                </div>
                <p className="text-slate-400 text-sm">Ideal para começar pequeno</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                {[
                  "Até 100 leads/mês",
                  "Até 7 carros no estoque",
                  "Suporte por email",
                  "1 Conexão WhatsApp",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                      <Check className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <SubscribeButton priceId="price_1S6HECBMIKs9aupq1sSp1H3S" />
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="group relative overflow-hidden border-violet-500/30 bg-violet-500/[0.03] backdrop-blur-2xl hover:border-violet-500/50 transition-all duration-500 rounded-[32px] p-1 scale-105 shadow-2xl shadow-violet-900/20">
            <div className="absolute top-0 right-0 p-4">
              <div className="inline-flex items-center gap-1.5 text-white px-4 py-1.5 rounded-full text-[11px] font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40 uppercase tracking-wider">
                <Star className="w-3 h-3 fill-white" />
                Mais Popular
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">R$ 297</span>
                  <span className="text-slate-500 text-sm font-medium">/mês</span>
                </div>
                <p className="text-slate-300 text-sm font-medium">Escalabilidade para sua loja</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                {[
                  "Até 300 leads/mês",
                  "Até 20 carros no estoque",
                  "Suporte Prioritário",
                  "3 Conexões WhatsApp",
                  "Relatórios Avançados",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white text-sm font-bold">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <SubscribeButton priceId="price_1S6HGABMIKs9aupq7f0LjcTQ" />
              </div>
            </CardContent>
          </Card>

          {/* Elite Plan */}
          <Card className="group relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-xl hover:border-white/20 transition-all duration-500 rounded-[32px] p-1">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Elite</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ 599</span>
                  <span className="text-slate-500 text-sm font-medium">/mês</span>
                </div>
                <p className="text-slate-400 text-sm">Alta performance e exclusividade</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                {[
                  "Até 1000 leads/mês",
                  "Até 50 carros no estoque",
                  "Suporte VIP 24/7",
                  "Gerente de Conta Dedicado",
                  "Conexões Ilimitadas",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                      <Check className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <SubscribeButton priceId="price_1T5YM0BMIKs9aupq5uE7UD4R" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-20">
          <p className="text-slate-500 text-sm font-medium">
            Garantia total de 7 dias. Cancele quando quiser diretamente pelo painel.
          </p>
        </div>
      </div>
    </div>
  );
}
