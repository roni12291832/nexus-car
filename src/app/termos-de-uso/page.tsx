import {
  CheckCircle,
  ShieldCheck,
  User,
  FileText,
  CreditCard,
  XCircle,
  AlertTriangle,
  Lock,
  RefreshCw,
  Gavel,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermosDeUso() {
  return (
    <div className="flex flex-col items-center justify-center py-2 bg-gray-100  text-justify ">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Termos de Uso da Flashly
        </h1>

        <p className="text-gray-700 mb-4">
          <FileText className="inline-block w-5 h-5 mr-2 " />
          <span className=" underline">Última atualização: 01/08/2025</span>
        </p>

        <p className="text-gray-700 mb-4">
          Bem-vindo à <strong>Flashly</strong>, uma plataforma online dedicada a
          facilitar os estudos por meio de flashcards personalizados e
          simulados. Ao acessar ou utilizar nossos serviços, você{" "}
          <span className=" underline">
            concorda com os presentes Termos de Uso
          </span>
          .
        </p>

        <p className="text-gray-700 mb-4">
          Estes Termos regem a relação entre você (usuário) e o responsável
          legal pela plataforma:
        </p>

        <p className="text-gray-700 mb-4">
          <strong>Razão Social:</strong> 58.311.422 Ícaro Wuandson Sousa Sales
          <br />
          <strong>CNPJ:</strong> 58.311.422/0001-68
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <CheckCircle className="inline-block w-5 h-5 mr-2 " />
          1. Aceitação dos Termos
        </h2>
        <p className="text-gray-700 mb-4">
          Ao criar uma conta, acessar ou utilizar a Flashly, você declara ter{" "}
          <span className=" underline">lido, compreendido e concordado</span>{" "}
          com estes Termos.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <ShieldCheck className="inline-block w-5 h-5 mr-2 " />
          2. Descrição do Serviço
        </h2>
        <p className="text-gray-700 mb-4">
          A Flashly oferece planos acessíveis para quem quer turbinar os
          estudos! Atualmente, você pode escolher entre o plano{" "}
          <strong>mensal por R$ 27,90</strong> ou o
          <strong> anual por R$ 238,80</strong>, garantindo acesso completo às
          funcionalidades da plataforma. Isso inclui o{" "}
          <span className="underline">estudo de flashcards já disponíveis</span>
          , simulados e muito mais.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <User className="inline-block w-5 h-5 mr-2 " />
          3. Cadastro e Acesso
        </h2>
        <p className="text-gray-700 mb-4">
          É necessário fornecer{" "}
          <span className=" underline">informações verdadeiras</span>, manter a
          senha segura e ser maior de 12 anos.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <AlertTriangle className="inline-block w-5 h-5 mr-2 " />
          4. Responsabilidades do Usuário
        </h2>
        <p className="text-gray-700 mb-4">
          O uso da Flashly deve ser para fins{" "}
          <span className=" underline">legais e educacionais</span>.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <FileText className="inline-block w-5 h-5 mr-2 " />
          5. Propriedade Intelectual
        </h2>
        <p className="text-gray-700 mb-4">
          Todo conteúdo (exceto inserido por usuários) é de propriedade de Ícaro
          Wuandson Sousa Sales.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <CreditCard className="inline-block w-5 h-5 mr-2 " />
          6. Pagamentos e Assinaturas
        </h2>
        <p className="text-gray-700 mb-4">
          A Flashly é uma plataforma paga e oferece planos acessíveis para seus
          usuários. Você pode escolher entre o{" "}
          <strong>plano mensal de R$ 27,90</strong> ou o
          <strong>plano anual de R$ 238,80</strong>, com acesso completo às
          funcionalidades da plataforma. O não pagamento poderá resultar na{" "}
          <span className="underline">suspensão do acesso</span> aos serviços
          contratados. Todos os pagamentos são processados com segurança através
          da <strong>Kiwify</strong>.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <XCircle className="inline-block w-5 h-5 mr-2 " />
          7. Cancelamento e Reembolsos
        </h2>
        <p className="text-gray-700 mb-4">
          O usuário pode cancelar a qualquer momento. Reembolsos seguem a{" "}
          <span className=" underline">política vigente</span>.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <AlertTriangle className="inline-block w-5 h-5 mr-2 " />
          8. Limitação de Responsabilidade
        </h2>
        <p className="text-gray-700 mb-4">
          A Flashly não se responsabiliza por falhas técnicas ou de conexão.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <Lock className="inline-block w-5 h-5 mr-2 " />
          9. Privacidade e Dados
        </h2>
        <p className="text-gray-700 mb-4">
          O uso dos dados segue nossa{" "}
          <span className=" underline">Política de Privacidade</span>.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <RefreshCw className="inline-block w-5 h-5 mr-2 " />
          10. Modificações nos Termos
        </h2>
        <p className="text-gray-700 mb-4">
          Termos podem ser atualizados. O uso contínuo implica{" "}
          <span className=" underline">aceitação</span>.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          <Gavel className="inline-block w-5 h-5 mr-2 " />
          11. Foro e Legislação
        </h2>
        <p className="text-gray-700 mb-4">
          Foro de Teresina, Piauí. Leis do Brasil aplicáveis.
        </p>

        <p className="text-gray-700 mt-6">
          <Mail className="inline-block w-5 h-5 mr-2 " />
          Dúvidas: <strong>contato@flashly.com.br</strong>
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
