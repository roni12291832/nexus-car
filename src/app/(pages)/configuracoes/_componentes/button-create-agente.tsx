"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/server";
import { DialogTrigger } from "@radix-ui/react-dialog";

export default function CriarAgente() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user?.id) return;
    setLoading(true);

    const { error } = await supabase.from("agents").insert([
      {
        user_id: user.id,
        name,
        instructions,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Erro ao criar agente:", error.message);
      alert("Erro ao criar agente");
      return;
    }

    setName("");
    setInstructions("");
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-[80vw] sm:w-[10vw]">Criar Agente</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Nome do agente"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="Instruções do agente"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              className="w-[10vw]"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
