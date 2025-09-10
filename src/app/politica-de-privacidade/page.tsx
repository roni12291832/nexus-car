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

export default function PoliticaDePrivacidade() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 w-screen text-justify ">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 " />
          Política de Privacidade
        </h1>

        <p className="mb-4">
          Esta <span className=" underline">Política de Privacidade</span>{" "}
          descreve como coletamos, usamos e protegemos suas informações pessoais
          quando você utiliza nosso aplicativo.
        </p>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <User className="w-5 h-5 " />
          Informações que Coletamos
        </h2>
        <p className="mb-4">
          Coletamos <span className=" underline">informações pessoais</span> que
          você nos fornece diretamente, como seu nome, endereço de e-mail e
          outras informações de contato.
        </p>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Send className="w-5 h-5 " />
          Uso das Informações
        </h2>
        <p className="mb-4">
          Usamos suas informações para{" "}
          <span className=" underline">fornecer nossos serviços</span>, melhorar
          a experiência do usuário, nos comunicar com você e para fins de{" "}
          <span className=" underline">marketing personalizado</span>, incluindo
          o envio de campanhas promocionais e ofertas de produtos da nossa
          empresa que possam ser do seu interesse.
        </p>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Share2 className="w-5 h-5 " />
          Compartilhamento de Informações
        </h2>
        <p className="mb-4">
          Não compartilhamos suas informações pessoais com terceiros, exceto
          quando necessário para{" "}
          <span className=" underline">fornecer nossos serviços</span> ou quando
          exigido por lei.
        </p>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 " />
          Segurança das Informações
        </h2>
        <p className="mb-4">
          Tomamos <span className=" underline">medidas razoáveis</span> para
          proteger suas informações pessoais contra acesso não autorizado, uso
          ou divulgação.
        </p>

        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <RefreshCcw className="w-5 h-5 " />
          Alterações nesta Política
        </h2>
        <p className="mb-4">
          Podemos atualizar esta Política de Privacidade periodicamente.
          Recomendamos que você{" "}
          <span className=" underline">revise esta página</span> regularmente
          para se manter informado sobre nossas práticas.
        </p>

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
