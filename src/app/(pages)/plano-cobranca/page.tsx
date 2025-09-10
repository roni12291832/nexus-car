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
import { useState } from "react";

export default function Billing() {
  const currentPlan = {
    name: "Plano Pro",
    price: "R$ 297",
    period: "mensal",
    status: "Ativo",
    nextBilling: "15/02/2024",
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
      period: "mensal",
      description: "Ideal para começar",
      features: [
        "Até 100 leads/mês",
        "1 conexão",
        "Até 7 carros no estoque",
        "Relatórios básicos",
        "Suporte por email",
      ],
      current: false,
      popular: false,
    },
    {
      name: "Pro",
      price: "R$ 297",
      period: "mensal",
      description: "Mais vendido",
      features: [
        "Até 300 leads/mês",
        "Até 3 conexões simultâneas",
        "Até 20 carros no estoque",
        "Relatórios avançados",
        "Suporte prioritário",
      ],
      current: true,
      popular: true,
    },
    {
      name: "Diamante",
      price: "Sob consulta",

      description: "Para grandes lojas",
      features: [
        "Leads ilimitados",
        "WhatsApp ilimitado",
        "API personalizada",
        "Estoque ilimitado",
        "Suporte dedicado",
      ],
      current: false,
      popular: false,
    },
  ];

  const invoices = [
    {
      id: "INV-001",
      date: "15/01/2024",
      amount: "R$ 97,00",
      status: "Pago",
      description: "Plano Pro - Janeiro 2024",
    },
    {
      id: "INV-002",
      date: "15/12/2023",
      amount: "R$ 97,00",
      status: "Pago",
      description: "Plano Pro - Dezembro 2023",
    },
    {
      id: "INV-003",
      date: "15/11/2023",
      amount: "R$ 97,00",
      status: "Pago",
      description: "Plano Pro - Novembro 2023",
    },
  ];

  // Feedback para loading dos botões (opcional, mas útil)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e histórico de pagamentos
          </p>
        </div>
      </div>

      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                <Badge className="bg-success text-success-foreground">
                  {currentPlan.status}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">
                {currentPlan.price}/{currentPlan.period}
              </p>
              <p className="text-sm text-muted-foreground">
                Próxima cobrança: {currentPlan.nextBilling}
              </p>
            </div>
            <div className="text-right space-y-2">
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Atualizar Pagamento
              </Button>
              <div className="text-sm text-muted-foreground">
                Cartão terminado em ****4532
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-2">
            <h4 className="font-medium">Recursos inclusos:</h4>
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar Plano</CardTitle>
          <CardDescription>
            Escolha o plano que melhor atende suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.current ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold text-primary">
                    {plan.price}
                    {plan.period && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-success" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current || loadingIndex === index}
                    onClick={async () => {
                      if (plan.current) return;
                      setLoadingIndex(index);
                      const planIdMap: Record<string, string> = {
                        Starter: "starter",
                        Pro: "pro",
                        Diamante: "diamante",
                      };
                      const planId = planIdMap[plan.name];
                      if (!planId) {
                        alert("Plano inválido!");
                        setLoadingIndex(null);
                        return;
                      }
                      try {
                        const res = await fetch("/api/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ planId }),
                        });
                        const data = await res.json();
                        setLoadingIndex(null);
                        if (data.init_point) {
                          window.location.href = data.init_point;
                        } else {
                          alert("Erro ao criar checkout!");
                        }
                      } catch {
                        setLoadingIndex(null);
                        alert("Falha na requisição.");
                      }
                    }}
                  >
                    {plan.current
                      ? "Plano Atual"
                      : loadingIndex === index
                      ? "Carregando..."
                      : "Escolher Plano"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Faturas
          </CardTitle>
          <CardDescription>Suas últimas cobranças e recibos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="font-medium">{invoice.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.id} • {invoice.date}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{invoice.amount}</div>
                    <Badge
                      variant="secondary"
                      className="bg-success text-success-foreground"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Uso do Plano
          </CardTitle>
          <CardDescription>
            Acompanhe o consumo dos recursos do seu plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Leads este mês</span>
                <span>156 / 1.000</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "15.6%" }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Veículos no estoque</span>
                <span>45 / Ilimitado</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
