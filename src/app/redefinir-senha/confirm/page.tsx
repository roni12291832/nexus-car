"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ConfirmResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const autenticarComToken = async () => {
      if (!token || !email) {
        toast.error("Link inválido para redefinição de senha.");
        router.push("/login");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (error) {
        console.error("Erro ao autenticar com token:", error);
        toast.error("Não foi possível validar o link de redefinição.");
        router.push("/login");
      }
    };

    autenticarComToken();
  }, [token, email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) throw error;

      toast.success("Senha redefinida com sucesso.");
      router.push("/login");
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast.error("Erro ao redefinir senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex  flex-col h-screen w-screen justify-center items-center px-4 ">
      
      <Card className="w-full max-w-md rounded-sm mt-2">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Insira sua nova senha abaixo para redefinir o acesso à sua conta.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input
                id="nova-senha"
                type="password"
                placeholder="********"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
              <Input
                id="confirmar-senha"
                type="password"
                placeholder="********"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-[#d8c622] hover:bg-[#f4e37b] text-black"
              type="submit"
              disabled={carregando}
            >
              {carregando ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground text-center">
          Lembrou sua senha?{" "}
          <Link href="/login" className="text-[#d8c622] hover:underline ml-1">
            Voltar ao login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
