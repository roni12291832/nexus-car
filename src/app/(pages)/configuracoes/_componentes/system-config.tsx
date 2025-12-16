"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabase/server";
import CardConnection from "./card-connection";
import WhatsAppConnections from "./whatsapp-conections";
import { toast } from "sonner";

interface StoreSettings {
  storeName: string;
  email: string;
  openTime?: string;
  closeTime?: string;
  weekendOpen?: boolean;
  businessHoursMessage?: string;
  numero: string;
  endereco: string;
  atendente: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "",
    email: user?.email || "",
    openTime: "08:00",
    closeTime: "18:00",
    numero: "",
    endereco: "",
    atendente: "",
    weekendOpen: true,
    businessHoursMessage:
      "Obrigado pelo contato! Nosso horário de atendimento é de segunda a sexta das 8h às 18h. Responderemos em breve!",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Erro ao buscar configurações:", error.message);
        }

        if (data) {
          setSettings({
            storeName: data.store_name ?? "",
            email: data.email ?? "",
            openTime: data.open_time ?? "08:00",
            closeTime: data.close_time ?? "18:00",
            weekendOpen: data.weekend_open ?? true,
            numero: data.numero ?? "", 
            endereco: data.endereco ?? "", 
            atendente: data.atendente ?? "", 
            businessHoursMessage: data.business_hours_message ?? "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const fetchUserSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setCustomerId(data.subscription_id || null);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados do usuário.");
      } finally {
      }
    };

    fetchUserSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from("store_settings").upsert(
        {
          user_id: user.id,
          store_name: settings.storeName,
          email: settings.email,
          open_time: settings.openTime,
          close_time: settings.closeTime,
          weekend_open: settings.weekendOpen,
          business_hours_message: settings.businessHoursMessage,
          numero: settings.numero,
          endereco: settings.endereco,
          atendente: settings.atendente,
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Erro ao salvar:", error.message);
      } else {
        console.log("Configurações salvas com sucesso!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!customerId) {
      toast.error("Erro.");
      return;
    }
    console.log("id da stripe", customerId);

    try {
      setLoadingPortal(true);

      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const data: { url?: string; error?: string } = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Erro ao criar sessão do portal.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível abrir o portal de cobrança.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Configure seu atendente virtual e as informações da sua loja
          </p>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informações da Loja</CardTitle>
              <CardDescription>
                Dados básicos da sua concessionária
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenBillingPortal}
              disabled={!customerId || loadingPortal}
              className="hidden md:block"
            >
              {loadingPortal
                ? "Abrindo portal..."
                : customerId
                ? "Gerenciar assinatura"
                : "Sem assinatura ativa"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 ">
                <Label htmlFor="storeName">Nome do atendente</Label>
                <Input
                  id="atendente"
                  value={settings.atendente}
                  onChange={(e) =>
                    setSettings({ ...settings, atendente: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="storeName">Endereço</Label>
                <Input
                  id="endereco"
                  value={settings.endereco ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, endereco: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid md:Lgrid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  readOnly
                  disabled
                  value={settings.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Numero da Loja (Notificacões)</Label>
                <Input
                  id="numero"
                  type="text"
                  required
                  placeholder="86999999999 - coloque com DDD"
                  value={settings.numero ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, numero: e.target.value })
                  }
                />
              </div>
            </div>

            <Separator />

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar WhatsApp
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Conectar WhatsApp</DialogTitle>
                  <DialogDescription>
                    Conecte seu número do WhatsApp para começar a receber leads
                    automaticamente.
                  </DialogDescription>
                </DialogHeader>

                <CardConnection />
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between mt-4">
              <div>
                <h3 className="font-medium">Salvar Configurações</h3>
                <p className="text-sm text-muted-foreground">
                  Suas alterações serão aplicadas imediatamente
                </p>
              </div>
              <Button onClick={saveSettings} disabled={isLoading} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar e Ativar Bot"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Separator />

      <p className="text-muted-foreground mb-4">
        Gerencie suas conexões do WhatsApp aqui. Adicione novos números ou
        remova os existentes.
      </p>
      <WhatsAppConnections />
    </div>
  );
}
