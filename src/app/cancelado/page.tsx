"use client";

import { Card } from "@/components/ui/card";
import { XCircle, AlertTriangle } from "lucide-react";

export default function CancelledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-background to-red-100 flex items-center justify-center p-4 dark:bg-gray-900">
      <Card className="max-w-2xl w-full p-8 text-center shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <XCircle className="w-24 h-24 text-destructive animate-pulse" />
              <AlertTriangle className="w-8 h-8 text-destructive absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
                Assinatura Cancelada
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-destructive to-accent mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4 text-lg">
              <p className="text-muted-foreground leading-relaxed">
                Sua assinatura foi cancelada. Você não terá mais acesso aos recursos premium da{" "}
                <span className="font-semibold text-destructive">FlashLy</span>.
              </p>

              <p className="text-foreground font-medium">
                Sentimos muito em vê-lo partir! Caso queira voltar, estamos sempre aqui para você.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Se precisar de ajuda ou quiser reativar seu plano, entre em contato com nosso suporte.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
