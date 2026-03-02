"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Crown,
  Zap,
  CreditCard,
  Calendar,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ... existing imports ...

export default function Billing() {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setProfile(data);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  const handleOpenBillingPortal = async () => {
    if (!profile?.subscription_id) {
      toast.error("Sem assinatura ativa para gerenciar.");
      return;
    }
    try {
      setLoadingPortal(true);
      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: profile.subscription_id }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Erro ao abrir portal.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const currentPlan = {
    name: profile?.plan_name ? `Plano ${profile.plan_name}` : "Carregando...",
    price: profile?.plan_price || "-",
    period: "mensal",
    status: profile?.subscription_id ? "Ativo" : "Pendente",
    nextBilling: profile?.next_billing || "A consultar",
    features: [
      "Até 300 leads/mês",
      "WhatsApp ilimitado",
      "Até 50 carros no estoque",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
  };

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      priceId: "price_1S6HECBMIKs9aupq1sSp1H3S",
      period: "mensal",
      description: "Ideal para começar",
      features: [
        "Até 100 leads/mês",
        "1 conexão",
        "Até 7 carros no estoque",
        "Relatórios básicos",
        "Suporte por email",
      ],
      current: profile?.plan_name === "Starter",
      popular: false,
    },
    {
      name: "Pro",
      price: "R$ 297",
      priceId: "price_1S6HGABMIKs9aupq7f0LjcTQ",
      period: "mensal",
      description: "Mais vendido",
      features: [
        "Até 300 leads/mês",
        "Até 3 conexões simultâneas",
        "Até 20 carros no estoque",
        "Relatórios avançados",
        "Suporte prioritário",
      ],
      current: profile?.plan_name === "Pro",
      popular: true,
    },
    {
      name: "Elite",
      price: "R$ 599",
      priceId: "price_1T5YM0BMIKs9aupq5uE7UD4R",
      period: "mensal",
      description: "Alta performance",
      features: [
        "Até 1000 leads/mês",
        "Até 50 carros no estoque",
        "Relatórios personalizados",
        "Suporte VIP",
        "Gestor de conta",
      ],
      current: profile?.plan_name === "Elite",
      popular: false,
    },
  ];

  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#050608] p-6 pb-20 antialiased">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-tight border-none">Minha Assinatura</h1>
          <p className="text-slate-400 font-light">
            Gerencie seu plano, faturas e acompanhe seu uso em tempo real.
          </p>
        </div>

        {/* Plano Atual */}
        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[32px] overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-violet-400" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-white">{currentPlan.name}</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-4 py-1 font-bold rounded-full">
                    {currentPlan.status}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-slate-300">
                  {currentPlan.price}<span className="text-slate-500 text-sm font-medium">/{currentPlan.period}</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-4">
                  <Calendar className="h-4 w-4" />
                  Próxima cobrança: <span className="font-bold text-slate-200">{currentPlan.nextBilling}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleOpenBillingPortal}
                disabled={loadingPortal || !profile?.subscription_id}
                className="bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 h-14 px-8 rounded-2xl font-bold shadow-xl transition-all"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loadingPortal ? "Abrindo..." : "Gerenciar Pagamentos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planos Disponíveis */}
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Alterar Plano</h2>
            <p className="text-slate-400 font-light mt-1">Escolha o plano ideal para o momento da sua loja</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-white/5 bg-white/[0.02] backdrop-blur-lg rounded-[32px] p-1 transition-all duration-300 hover:border-white/20 ${plan.current ? "border-violet-500/50 bg-violet-500/[0.03]" : ""
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-lg shadow-violet-900/40">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-500">{plan.description}</CardDescription>
                  <div className="text-3xl font-black text-white mt-4">
                    {plan.price}
                    <span className="text-sm font-medium text-slate-500 ml-1">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="space-y-3 min-h-[140px]">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-slate-400">
                        <Check className="h-4 w-4 text-violet-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full h-12 rounded-xl font-bold transition-all ${plan.current
                        ? "bg-white/5 text-slate-400 border border-white/5 cursor-default hover:bg-white/5"
                        : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20"
                      }`}
                    disabled={plan.current || loadingIndex === index}
                    onClick={async () => {
                      if (plan.current) return;
                      setLoadingIndex(index);
                      try {
                        const res = await fetch("/api/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            priceId: plan.priceId,
                            user_id: profile?.user_id
                          }),
                        });
                        const data = await res.json();
                        if (data.sessionId) {
                          const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
                          await stripe?.redirectToCheckout({ sessionId: data.sessionId });
                        }
                      } finally {
                        setLoadingIndex(null);
                      }
                    }}
                  >
                    {plan.current ? "Seu Plano Atual" : loadingIndex === index ? "Carregando..." : "Selecionar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
