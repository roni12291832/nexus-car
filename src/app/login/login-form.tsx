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
import { Eye, EyeOff, Check } from "lucide-react";
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
    <div className="flex justify-center items-center flex-col">
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-white/5 rounded-2xl mb-8 backdrop-blur-md border border-white/10">
          <TabsTrigger
            value="register"
            className="rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400 text-sm font-bold transition-all duration-300 px-4"
          >
            Criar conta
          </TabsTrigger>
          <TabsTrigger
            value="login"
            className="rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400 text-sm font-bold transition-all duration-300 px-4"
          >
            Entrar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-0 focus-visible:outline-none">
          <Card className="border-white/10 shadow-2xl rounded-[32px] bg-[#0f1117]/80 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-white">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-slate-400">
                Acesse sua conta para gerenciar seus negócios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-senha" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 h-12 rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white h-12 rounded-xl font-bold shadow-lg shadow-violet-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

        <TabsContent value="register" className="mt-0 focus-visible:outline-none">
          <Card className="border-white/10 shadow-2xl rounded-[32px] bg-[#0f1117]/80 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-white">Criar sua conta</CardTitle>
              <CardDescription className="text-slate-400">
                Junte-se a milhares de concessionárias que usam Nexus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail corporativo</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" title="Mínimo 8 caracteres" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Senha</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPasswordRegister ? "text" : "password"}
                      placeholder="********"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 h-12 rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordRegister((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
                  <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswordRegisterConfirm ? "text" : "password"}
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 h-12 rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordRegisterConfirm((prev) => !prev)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white h-12 rounded-xl font-bold shadow-lg shadow-violet-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  type="submit"
                >
                  Criar conta agora
                </Button>
              </form>

              <div className="mt-4">
                <Separator className="bg-white/5" />
                <div className="mt-6">
                  <SignInGoogleButton />
                </div>
              </div>
            </CardContent>

            <CardFooter className="text-[11px] text-slate-500 text-center pb-6">
              <p>
                Ao registrar, você aceita nossos
                <Link
                  className="text-violet-400 hover:text-violet-300 transition-colors px-1"
                  href="/termos-de-uso"
                >
                  Termos
                </Link>
                e
                <Link
                  className="text-violet-400 hover:text-violet-300 transition-colors px-1"
                  href="/politica-de-privacidade"
                >
                  Privacidade.
                </Link>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="rounded-[40px] border border-white/10 shadow-2xl bg-[#0f1117] p-10 max-w-md">
          <DialogHeader className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-bold text-center text-white">Quase lá!</DialogTitle>
              <DialogDescription className="text-center text-slate-400 text-lg">
                Enviamos um link de confirmação para o seu e-mail.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8">
            <Button
              onClick={() => setOpenDialog(false)}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-violet-900/40 transition-all hover:scale-[1.05] active:scale-[0.95]"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
