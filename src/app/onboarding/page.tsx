"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import Image from "next/image";

const formSchema = z.object({
  full_name: z.string().min(2, "Nome obrigatório"),
  cpf_cnpj: z.string().min(11, "CPF/CNPJ obrigatório"),
  phone: z.string().min(8, "Telefone obrigatório"),
  how_did_you_find_us: z.string().min(2, "Campo obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

export default function OnboardingNexusCar() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      cpf_cnpj: "",
      phone: "",
      how_did_you_find_us: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    const { error } = await supabase.from("users").insert({
      user_id: user.id,
      email: user.email,
      ...data,
    });

    if (error) {
      console.error("Erro ao salvar cliente:", error);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen px-4">
      <Image src="/assets/logo.png" alt="Logo" width={150} height={50} />
      <Card className="bg-white rounded-sm p-8 w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>Bem-vindo(a)</CardTitle>
          <CardDescription>Complete os dados para prosseguir.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-sm text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input id="cpf_cnpj" {...register("cpf_cnpj")} />
              {errors.cpf_cnpj && (
                <p className="text-sm text-red-500">
                  {errors.cpf_cnpj.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="how_did_you_find_us">Como nos conheceu?</Label>
              <Select
                onValueChange={(value) =>
                  setValue("how_did_you_find_us", value)
                }
                defaultValue=""
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.how_did_you_find_us && (
                <p className="text-sm text-red-500">
                  {errors.how_did_you_find_us.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-[#372b82]  text-white">
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
