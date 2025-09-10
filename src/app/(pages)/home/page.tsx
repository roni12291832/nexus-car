"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Users,
  Car,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";

interface Lead {
  id: string;
  nomewpp: string;
  created_at: string;
}

interface Activity {
  time: string;
  event: string;
  description: string;
  badge: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [leadsHoje, setLeadsHoje] = useState(0);
  const [ultimoLead, setUltimoLead] = useState<Lead | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      try {
        // Leads de hoje
        const { data: leadsData, error: leadsError } = await supabase
          .from("dados_cliente")
          .select("id")
          .gte("created_at", todayStart.toISOString())
          .lte("created_at", todayEnd.toISOString());

        if (leadsError)
          console.error("Erro ao buscar leads de hoje:", leadsError.message);
        else setLeadsHoje(leadsData?.length || 0);

        // Último lead
        const { data: ultimoData, error: ultimoError } = await supabase
          .from("dados_cliente")
          .select("id, nomewpp, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (ultimoError)
          console.error("Erro ao buscar último lead:", ultimoError.message);
        else if (ultimoData)
          setUltimoLead({
            id: ultimoData.id,
            nomewpp: ultimoData.nomewpp,
            created_at: ultimoData.created_at,
          });

        // Status WhatsApp do usuário
        if (user?.id) {
          const { data: whatsappData, error: whatsappError } = await supabase
            .from("whatsapp_instances")
            .select("status")
            .eq("user_id", user.id)
            .single();

          if (whatsappError)
            console.error(
              "Erro ao buscar status WhatsApp:",
              whatsappError.message
            );
          else setWhatsappConnected(whatsappData?.status === "conectado");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [user?.id]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("created_at, phone, nomewpp, user_message")
          .order("created_at", { ascending: false })
          .limit(10); 

        if (error) {
          console.error("Erro ao buscar atividades:", error.message);
          return;
        }

        const mappedActivities: Activity[] = data.map((item) => ({
          time: new Date(item.created_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          event: "Mensagem recebida",
          description: `${item.nomewpp} (${item.phone}) disse: ${item.user_message}`,
          badge: "Lead",
        }));

        setActivities(mappedActivities);
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    fetchActivities();
  }, []);

  const statsCards = [
    {
      title: "Leads Hoje",
      value: leadsHoje.toString(),
      description: "+15% em relação a ontem",
      icon: Users,
      trend: "up",
    },
    {
      title: "Carros Mais Consultados",
      value: "SUV Honda HR-V",
      description: "12 consultas hoje",
      icon: Car,
      trend: "neutral",
    },
    {
      title: "Último Lead",
      value: ultimoLead
        ? new Date(ultimoLead.created_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      description: ultimoLead ? ultimoLead.nomewpp : "-",
      icon: Clock,
      trend: "neutral",
    },
    {
      title: "Status WhatsApp",
      value: whatsappConnected ? "Conectado" : "Desconectado",
      description: whatsappConnected
        ? "Bot ativo e funcionando"
        : "Conecte o WhatsApp",
      icon: MessageSquare,
      trend: whatsappConnected ? "up" : "down",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Olá ! Aqui está o resumo do seu negócio hoje.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              {card.trend === "up" && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                </div>
              )}
              {card.trend === "down" && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="h-3 w-3 text-warning" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas interações e eventos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    {activity.time}
                  </div>
                  <div>
                    <div className="font-medium">{activity.event}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.description}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">{activity.badge}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
