"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/server";
import Link from "next/link";

export default function EsqueciSenha() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://app.flashly.com.br/redefinir-senha/confirm",
    });

    if (error) {
      toast.error("Erro ao enviar o link de recuperação. Tente novamente.");
    } else {
      toast.success("Link de recuperação enviado! Verifique seu e-mail.");
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen w-screen justify-center items-center flex-col">
      <Card className="rounded-sm md:max-w-[25vw] lg:max-w-[32vw] mt-4 mx-4">
        <CardHeader>
          <CardTitle>Recuperar Senha</CardTitle>
          <CardDescription>
            Digite o e-mail cadastrado para receber um link de recuperação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handlePasswordReset}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              className="w-full my-4 bg-[#372b82] text-white "
              type="submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground text-center">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-[#372b82] hover:underline">
            Clique aqui para entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
