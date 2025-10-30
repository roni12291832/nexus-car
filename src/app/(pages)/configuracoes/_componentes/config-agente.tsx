"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Edit3 } from "lucide-react";
import CriarAgente from "./button-create-agente";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/server";
import { toast } from "sonner";

type Agent = {
  id: string;
  name: string;
  instructions: string;
  status: "ativo" | "inativo";
  lastUpdate: string;
};

export default function AgentConfigPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", instructions: "" });

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("agents")
        .select("id, name, instructions, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar agentes:", error.message);
        return;
      }

      const mapped: Agent[] =
        data?.map((agent) => ({
          id: agent.id,
          name: agent.name,
          instructions: agent.instructions,
          status: agent.status,
          lastUpdate: new Date(agent.created_at).toLocaleString("pt-BR"),
        })) || [];

      setAgents(mapped);
    };

    fetchAgents();
  }, [user?.id]);

  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({ name: agent.name, instructions: agent.instructions });
    setIsModalOpen(true);
  };

  const handleEditAgent = async () => {
    if (!selectedAgent) return;

    const { error } = await supabase
      .from("agents")
      .update({
        name: formData.name,
        instructions: formData.instructions,
      })
      .eq("id", selectedAgent.id);

    if (error) {
      console.error("Erro ao atualizar agente:", error.message);
      toast.error("Erro ao atualizar agente");
      return;
    }

    setAgents((prev) =>
      prev.map((a) =>
        a.id === selectedAgent.id
          ? {
              ...a,
              name: formData.name,
              instructions: formData.instructions,
              lastUpdate: new Date().toLocaleString("pt-BR"),
            }
          : a
      )
    );

    setIsModalOpen(false);
    setSelectedAgent(null);
  };

  // const handleSaveAgent = () => {
  //   if (selectedAgent) {
  //     setAgents(
  //       agents.map((agent) =>
  //         agent.id === selectedAgent.id
  //           ? {
  //               ...agent,
  //               name: formData.name,
  //               instructions: formData.instructions,
  //               lastUpdate: new Date().toLocaleString("pt-BR"),
  //             }
  //           : agent
  //       )
  //     );
  //   }
  //   setIsModalOpen(false);
  //   setSelectedAgent(null);
  // };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
    setFormData({ name: "", instructions: "" });
  };

  return (
    <div>
      <div>
        <div className="mb-8 flex lg:flex-row items-center justify-between flex-col  ">
          <p className="text-muted-foreground leading-relaxed ">
            Defina como o agente deve se comportar, configure instruções
            personalizadas e dê um nome único para cada assistente.
          </p>

          <CriarAgente />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold">
                      {agent.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          agent.status === "ativo" ? "default" : "secondary"
                        }
                        className={
                          agent.status === "ativo"
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(agent)}
                    className="shrink-0"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar Configuração
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Última atualização: {agent.lastUpdate}</span>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {agent.instructions.length > 100
                    ? `${agent.instructions.substring(0, 100)}...`
                    : agent.instructions}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Configuration Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-semibold">
              Editar Agente de IA
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Defina o nome e as instruções para personalizar o comportamento do
              seu agente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name" className="text-sm font-medium">
                Nome do Agente
              </Label>
              <Input
                id="agent-name"
                placeholder="Selecione um nome para seu agente"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="agent-instructions"
                className="text-sm font-medium"
              >
                Instruções
              </Label>
              <Textarea
                id="agent-instructions"
                placeholder='Digite aqui as instruções que o agente deve seguir, como tom de voz, estilo de resposta e objetivos principais.&#10;&#10;Exemplo:&#10;"Você é um atendente amigável e consultivo. Ajude o cliente de forma clara, rápida e empática."'
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditAgent}
              className="bg-primary hover:bg-primary/90"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
