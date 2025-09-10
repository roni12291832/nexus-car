"use client";

import { Check, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import SubscribeButton from "./_componentes/button";

export default function PlanNotActivated() {
  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4 dark:bg-gray-900">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Parautilizar todos os recursos da plataforma, é
            necessário ativar um plano. Escolha a opção que melhor se adapta às
            suas necessidades:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-2">
          <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-smooth">
            <CardContent className="p-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Starter
                </h3>
                <div className="mb-4">
                  <span className="text-xl font-bold text-primary">
                    R$ 97,90
                  </span>
                  <span className="text-muted-foreground ml-2">/ mês</span>
                </div>

                <p className="text-muted-foreground">Ideal para começar</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Até 100 leads/mês</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">1 conexão</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">
                    Até 7 carros no estoque
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Relatórios básicos</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Suporte por email</span>
                </div>
              </div>

              <SubscribeButton priceId="price_1S5AcTAigAbsBK16SVfqPEgk" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-premium/30 bg-card/50 backdrop-blur-sm hover:shadow-premium transition-smooth">
            <div className="absolute top-4 right-4">
              <div className="inline-flex items-center gap-1 text-white px-3 py-1 rounded-full text-sm font-medium bg-[#372b82]">
                <Star className="w-4 h-4" />
                Mais Popular
              </div>
            </div>

            <CardContent className="p-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                <div className="mb-2">
                  <span className="text-xl font-bold text-premium">
                    R$ 297,90
                  </span>
                  <span className="text-muted-foreground ml-2">/ mês</span>
                </div>

                <p className="text-muted-foreground">
                  Ideal para escalar seu negócio
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Até 300 leads/mês</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">3 conexões</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">
                    Até 20 carros no estoque
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Relatórios avançados</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Suporte prioritário</span>
                </div>
              </div>

              <SubscribeButton priceId="price_1S5AcTAigAbsBK16gxlTXUna" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-smooth">
            <CardContent className="p-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Diamante
                </h3>
                <div className="mb-4">
                  <span className="text-xl font-bold text-primary">
                    Sob consulta
                  </span>
                </div>

                <p className="text-muted-foreground">Para grandes empresas</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Leads ilimitados</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">WhatsApp ilimitado</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">API personalizada</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Estoque ilimitado</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Suporte dedicado</span>
                </div>
              </div>

              <SubscribeButton priceId="price_1S5AcTAigAbsBK16SVfqPEgk" />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Todos os planos incluem 14 dias de grátis. Cancele a qualquer
            momento.
          </p>
        </div>
      </div>
    </div>
  );
}
