import {
  ShieldCheck,
  User,
  Send,
  Share2,
  Lock,
  RefreshCcw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PoliticaDePrivacidadeNexusCar() {
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100  text-justify">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" />
          Política de Privacidade – NexusCar
        </h1>

        <p className="mb-4">
          <span className="underline">Última atualização:</span> {dataAtual}
        </p>

        <p className="mb-4">
          A <strong>NexusCar</strong> respeita a sua privacidade e está
          comprometida com a proteção dos seus dados. Esta Política explica como
          coletamos, usamos, armazenamos e compartilhamos suas informações.
        </p>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <User className="w-5 h-5" />
          1. Informações que coletamos
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Dados cadastrais (nome, e-mail, telefone, nome da loja)</li>
          <li>Número do WhatsApp vinculado</li>
          <li>Mensagens enviadas e recebidas via integração com IA</li>
          <li>Informações de navegação no painel (logs e métricas)</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Send className="w-5 h-5" />
          2. Como utilizamos seus dados
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Ativar o agente de IA no WhatsApp</li>
          <li>Entregar funcionalidades do painel NexusCar</li>
          <li>Analisar desempenho do atendimento</li>
          <li>
            Garantir segurança, suporte técnico e melhoria contínua do serviço
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          3. Compartilhamento de dados
        </h2>
        <p className="mb-2">
          Seus dados <span className="underline">não são vendidos</span>. Eles
          podem ser compartilhados com:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            Parceiros técnicos, como a API de WhatsApp e a infraestrutura de
            automação (como n8n, Render, UZAPI)
          </li>
          <li>
            Plataformas de analytics, para melhorar a experiência do usuário
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          4. Armazenamento e segurança
        </h2>
        <p className="mb-4">
          Utilizamos <span className="underline">criptografia</span>, tokens de
          autenticação e servidores confiáveis para proteger seus dados.
          Armazenamos as informações apenas pelo tempo necessário para cumprir
          as finalidades propostas.
        </p>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <RefreshCcw className="w-5 h-5" />
          5. Seus direitos
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Solicitar a exclusão ou edição dos seus dados</li>
          <li>Revogar consentimentos</li>
          <li>Solicitar portabilidade</li>
        </ul>

        <div className="mt-6 flex justify-center items-center w-full">
          <Link href="/login">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
