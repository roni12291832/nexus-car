"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
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

const formSchema = z.object({
  full_name: z.string().min(2, "Nome obrigatório"),
  phone: z.string().min(8, "Telefone obrigatório"),
  birthdate: z.string().min(8, "Data obrigatória"),
  how_did_you_find_us: z.string().min(2, "Campo obrigatório"),
  study_goal: z.string().min(2, "Campo obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

export default function Onboarding() {
  const [step, setStep] = useState(1);
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
      phone: "",
      birthdate: "",
      how_did_you_find_us: "",
      study_goal: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        ...data,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao salvar onboarding:", error);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen  px-4">
      <Card className="bg-white  rounded-sm p-8 w-full max-w-md">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>Complete seu perfil para continuar.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="birthdate">Data de nascimento</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    {...register("birthdate")}
                  />
                  {errors.birthdate && (
                    <p className="text-sm text-red-500">
                      {errors.birthdate.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className=" bg-[#d8c622] hover:bg-[#f4e37b] text-black"
                  >
                    Próximo
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="how_did_you_find_us">
                    Como nos conheceu?
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("how_did_you_find_us", value)
                    }
                    defaultValue=""
                  >
                    <SelectTrigger>
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

                <div>
                  <Label htmlFor="study_goal">Qual seu objetivo?</Label>
                  <Select
                    onValueChange={(value) => setValue("study_goal", value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enem">ENEM</SelectItem>
                      <SelectItem value="faculdade">Faculdade</SelectItem>
                      <SelectItem value="reforco">Reforço escolar</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.study_goal && (
                    <p className="text-sm text-red-500">
                      {errors.study_goal.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className=" bg-[#d8c622] hover:bg-[#f4e37b] text-black"
                  >
                    Finalizar
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
