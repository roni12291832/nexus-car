"use client";

import { useEffect } from "react";

import { Card } from "@/components/ui/card";
import { CheckCircle, Sparkles } from "lucide-react";

export default function Page() {
  useEffect(() => {
    const createConfetti = () => {
      const colors = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];
      const confettiContainer = document.createElement("div");
      confettiContainer.style.position = "fixed";
      confettiContainer.style.top = "0";
      confettiContainer.style.left = "0";
      confettiContainer.style.width = "100%";
      confettiContainer.style.height = "100%";
      confettiContainer.style.pointerEvents = "none";
      confettiContainer.style.zIndex = "1000";
      document.body.appendChild(confettiContainer);

      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.style.position = "absolute";
        confetti.style.width = "10px";
        confetti.style.height = "10px";
        confetti.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.animation = `fall ${
          3 + Math.random() * 3
        }s linear infinite`;
        confetti.style.opacity = "0.8";
        confetti.style.transform = "rotate(45deg)";
        confettiContainer.appendChild(confetti);
      }

      setTimeout(() => {
        document.body.removeChild(confettiContainer);
      }, 10000);
    };

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);

    createConfetti();

    return () => {
      const styleEl = document.querySelector("style:last-child");
      if (styleEl && styleEl.textContent?.includes("@keyframes fall")) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-light via-background to-success-light flex items-center justify-center p-4 dark:bg-gray-900">
      <Card className="max-w-2xl w-full p-8 text-center shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="w-24 h-24 text-success animate-pulse" />
              <Sparkles className="w-8 h-8 text-success absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
                Obrigado por sua assinatura!
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-success to-accent mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4 text-lg">
              <p className="text-muted-foreground leading-relaxed">
                Seu plano foi ativado com sucesso. Agora você tem acesso
                completo a todos os recursos da{" "}
                <span className="font-semibold text-success">FlashLy</span>.
              </p>

              <p className="text-foreground font-medium">
                Estamos felizes em ter você com a gente!
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Caso tenha alguma dúvida, nossa equipe de suporte está sempre
              disponível para ajudar.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
