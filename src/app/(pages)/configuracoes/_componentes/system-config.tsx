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

interface StoreSettings {
  storeName: string;
  email: string;
  openTime: string;
  closeTime: string;
  weekendOpen: boolean;
  businessHoursMessage: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "",
    email: user?.email || "",
    openTime: "08:00",
    closeTime: "18:00",
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
            storeName: data.store_name,
            email: data.email,
            openTime: data.open_time,
            closeTime: data.close_time,
            weekendOpen: data.weekend_open,
            businessHoursMessage: data.business_hours_message,
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
          <CardHeader>
            <CardTitle>Informações da Loja</CardTitle>
            <CardDescription>
              Dados básicos da sua concessionária
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Abertura</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={settings.openTime}
                  onChange={(e) =>
                    setSettings({ ...settings, openTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeTime">Fechamento</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={settings.closeTime}
                  onChange={(e) =>
                    setSettings({ ...settings, closeTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="weekendOpen"
                checked={settings.weekendOpen}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, weekendOpen: checked })
                }
              />
              <Label htmlFor="weekendOpen">Atender nos fins de semana</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessHoursMessage">
                Mensagem fora do horário
              </Label>
              <Textarea
                id="businessHoursMessage"
                placeholder="Mensagem para fora do horário comercial"
                value={settings.businessHoursMessage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    businessHoursMessage: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

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
