"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import SignInGoogleButton from "./sign-in-google";

export default function LoginForm() {
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showPasswordRegisterConfirm, setShowPasswordRegisterConfirm] =
    useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createClient();

    if (!loginEmail || !loginPassword) {
      toast.error("Por favor, preencha e-mail e senha.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      toast.error("Digite um e-mail válido.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast.error(
        error.message || "Erro no login. Verifique suas credenciais."
      );
    } else {
      toast.success("Login realizado com sucesso!");
      router.push("/");
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (registerPassword !== confirmPassword) {
      toast("As senhas não coincidem.");
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
    });

    if (error) {
      console.error("Erro no cadastro:", JSON.stringify(error, null, 2));

      toast.error("Erro no registro. Tente novamente.");
    } else if (data.session) {
      setOpenDialog(true);
    } else {
      toast("Verifique seu e-mail para confirmar o registro.");
    }
  };

  return (
    <div className="flex justify-center items-center flex-col dark:bg-gray-900">
      <Tabs defaultValue="login" className=" rounded-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Já tem conta? Entre</TabsTrigger>
          <TabsTrigger value="register">Novo? Registre-se</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Insira suas credenciais para acessar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#372b82]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full my-4 bg-[#372b82]  text-white"
                  type="submit"
                >
                  Entrar
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <Separator className="my-4" />
                <div className="space-y-2">
                  <SignInGoogleButton />
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground text-center">
              Esqueceu sua senha?{" "}
              <Link
                href="/esqueci-senha"
                className="text-[#372b82] hover:underline"
              >
                Clique aqui
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle>Registre-se</CardTitle>
              <CardDescription>
                Crie uma conta preenchendo as informações abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPasswordRegister ? "text" : "password"}
                      placeholder="********"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordRegister((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#372b82]"
                    >
                      {showPasswordRegister ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirme sua senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswordRegisterConfirm ? "text" : "password"}
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordRegisterConfirm((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#372b82]"
                    >
                      {showPasswordRegisterConfirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full my-4 bg-[#372b82]  text-white"
                  type="submit"
                >
                  Registrar
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <Separator className="my-4" />
                <div className="space-y-2">
                  <SignInGoogleButton />
                </div>
              </div>
            </CardContent>

            <CardFooter className="text-sm text-muted-foreground text-center">
              <p>
                Ao clicar em &quot;Registrar&quot;, você concorda com nossos
                <Link
                  className="text-[#372b82] underline"
                  href="/termos-de-uso"
                >
                  {" "}
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link
                  className="text-[#372b82] underline"
                  href="/politica-de-privacidade"
                >
                  Política de Privacidade.
                </Link>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conta criada com sucesso!</DialogTitle>
            <DialogDescription>
              Agora vá até a aba{" "}
              <strong>&quot;Já tem conta? Entre&quot;</strong> e acesse com seu
              e-mail e senha pela primeira vez.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setOpenDialog(false)}
              className="bg-[#372b82] text-black hover:bg-[#f4e37b]"
            >
              Ok, entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
