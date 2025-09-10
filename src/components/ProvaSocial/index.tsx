import { CheckCircle, BookOpen, FileText, Star } from "lucide-react";

const SocialProof = () => {
  const stats = [
    {
      icon: BookOpen,
      text: "Atendimento automatizado 24/7 para seus clientes",
    },
    {
      icon: FileText,
      text: "Qualificação de leads e agendamento de test drives com IA",
    },
    {
      icon: CheckCircle,
      text: "Aumente suas vendas com respostas rápidas e inteligentes",
    },
    {
      icon: Star,
      text: "Melhore a experiência do cliente e fidelize compradores",
    },
  ];

  return (
    <div className="space-y-6 ">
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{stat.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-light p-4 rounded-lg border border-border/50 dark:border-gray-400">
        <blockquote className="text-sm italic text-foreground/80 mb-2">
          &quot;O Nexus Car transformou nosso atendimento: agora respondemos clientes rapidamente e aumentamos nossas vendas.&quot;
        </blockquote>
        <footer className="text-xs text-muted-foreground">
          — João Carlos, @joaocarlosautos
        </footer>
      </div>
    </div>
  );
};

export default SocialProof;
