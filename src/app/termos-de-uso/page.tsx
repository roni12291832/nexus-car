import {
  FileText,
  ShieldCheck,
  User,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Gavel,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermosDeUsoNexusCar() {
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center py-2 bg-gray-100 text-justify">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          📄 Termos de Uso – NexusCar
        </h1>

        <p className="text-gray-700 mb-4">
          <FileText className="inline-block w-5 h-5 mr-2" />
          <span className="underline">Última atualização: {dataAtual}</span>
        </p>

        <p className="text-gray-700 mb-4">
          Este documento regula o uso do aplicativo <strong>NexusCar</strong>. Ao
          utilizá-lo, você concorda com os termos a seguir:
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <ShieldCheck className="inline-block w-5 h-5 mr-2" />
          1. Descrição do serviço
        </h2>
        <p className="text-gray-700 mb-4">
          A NexusCar oferece um painel para lojistas do setor automotivo
          conectarem seus números de WhatsApp a um agente de IA inteligente,
          capaz de automatizar atendimentos, enviar fotos de veículos, coletar
          dados de clientes e muito mais.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <User className="inline-block w-5 h-5 mr-2" />
          2. Uso permitido
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Informar dados reais no momento do cadastro</li>
          <li>Utilizar o serviço de forma ética e legal</li>
          <li>
            Não utilizar o agente para spam, golpes ou práticas abusivas
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          <CreditCard className="inline-block w-5 h-5 mr-2" />
          3. Planos e pagamentos
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>
            O acesso ao NexusCar está condicionado à contratação de um plano
            mensal ou anual
          </li>
          <li>
            O cancelamento do plano pode ser feito a qualquer momento, porém não
            haverá reembolso proporcional
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          <AlertTriangle className="inline-block w-5 h-5 mr-2" />
          4. Limitações de responsabilidade
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Conteúdo enviado pelo usuário via WhatsApp</li>
          <li>
            Resultados de vendas ou fechamento de negócios gerados via IA
          </li>
          <li>
            Falhas externas da API do WhatsApp, n8n ou outras integrações
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          <RefreshCw className="inline-block w-5 h-5 mr-2" />
          5. Modificações
        </h2>
        <p className="text-gray-700 mb-4">
          Reservamo-nos o direito de alterar estes termos a qualquer momento.
          Recomendamos que você os revise periodicamente.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <Gavel className="inline-block w-5 h-5 mr-2" />
          Foro e legislação
        </h2>
        <p className="text-gray-700 mb-4">
          Foro de Teresina, Piauí. Leis do Brasil aplicáveis.
        </p>

        <p className="text-gray-700 mt-6">
          <Mail className="inline-block w-5 h-5 mr-2" />
          Dúvidas: <strong>contato@nexuscar.com.br</strong>
        </p>

        <div className="mt-8 text-center">
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
