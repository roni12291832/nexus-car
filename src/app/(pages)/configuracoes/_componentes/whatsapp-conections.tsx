"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Wifi, WifiOff, LogOut, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

type WhatsAppConnection = {
  id: string;
  instance_name: string;
  number?: string;
  status: "conectado" | "desconectado";
  qr_code_base64?: string | null;
  uazapi_token?: string;
};

export default function WhatsAppConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchLocalConnections = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("whatsapp_instances")
      .select("*")
      .eq("user_id", user.id);

    if (error)
      return console.error("Erro ao buscar conexões locais:", error.message);
    setConnections(data || []);
  }, [user?.id]);

  // Sincroniza o status real com a UAZAPI e remove registros sem instância válida
  const syncWithUazapi = useCallback(async () => {
    if (!user?.id || connections.length === 0) return;
    setSyncing(true);
    try {
      for (const conn of connections) {
        if (!conn.uazapi_token) {
          // Sem token: remove o registro órfão do Supabase
          await supabase.from("whatsapp_instances").delete().eq("id", conn.id);
          continue;
        }

        // Verifica status real na UAZAPI
        const res = await fetch(`/api/whatsapp/status?token=${conn.uazapi_token}`);
        if (!res.ok) {
          // Instância não existe mais na UAZAPI → remove do Supabase
          await supabase.from("whatsapp_instances").delete().eq("id", conn.id);
          continue;
        }

        const data = await res.json() as { instance?: { status?: string }; status?: { connected?: boolean } };
        const isConnected = data?.status?.connected === true;
        const newStatus = isConnected ? "conectado" : "desconectado";

        if (newStatus !== conn.status) {
          await supabase
            .from("whatsapp_instances")
            .update({ status: newStatus })
            .eq("id", conn.id);
        }
      }
      await fetchLocalConnections();
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    } finally {
      setSyncing(false);
    }
  }, [user?.id, connections, fetchLocalConnections]);

  useEffect(() => {
    fetchLocalConnections();
  }, [fetchLocalConnections]);

  const generateQr = async (instanceName: string, token?: string) => {
    if (!token) return console.error("Token não encontrado para gerar QR");
    try {
      const res = await fetch(`/api/whatsapp/qr?instance=${instanceName}&token=${token}`);
      if (!res.ok) throw new Error("Falha ao gerar QR Code");

      const data = await res.json() as { base64?: string };

      setConnections((prev) =>
        prev.map((c: WhatsAppConnection) =>
          c.instance_name === instanceName
            ? { ...c, qr_code_base64: data.base64 }
            : c
        )
      );

      await supabase
        .from("whatsapp_instances")
        .update({ status: "conectado" })
        .eq("instance_name", instanceName);
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectInstance = async (
    instanceId: string,
    instanceName: string,
    token?: string
  ) => {
    setLoading(true);
    try {
      // Se tem token, faz logout na UAZAPI
      if (token) {
        const res = await fetch("/api/uazapi/disconnect", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instanceName, token }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.warn(`Aviso ao desconectar na UAZAPI: ${res.status} - ${text}`);
          // Mesmo com erro na UAZAPI, remove do Supabase
        }
      }

      // Sempre remove o registro do Supabase independentemente do resultado na UAZAPI
      await supabase.from("whatsapp_instances").delete().eq("id", instanceId);

      // Atualiza lista local imediatamente sem precisar buscar novamente
      setConnections((prev) => prev.filter((c) => c.id !== instanceId));
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botão de sincronização */}
      {connections.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithUazapi}
            disabled={syncing}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar status"}
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {connections.map((conn) => (
          <Card
            key={conn.instance_name}
            className="flex items-center justify-center"
          >
            <CardHeader className="flex flex-row items-center justify-center ">
              {conn.status === "conectado" ? (
                <Badge className="flex items-center gap-1">
                  <Wifi className="w-4 h-4" /> Conectado
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="w-4 h-4" /> Desconectado
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-2 flex flex-col items-center justify-center">
              {conn.status === "conectado" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Este WhatsApp está ativo.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      disconnectInstance(conn.id, conn.instance_name, conn.uazapi_token)
                    }
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4" /> Desconectar
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => generateQr(conn.instance_name, conn.uazapi_token)}
                      >
                        <QrCode className="w-4 h-4" /> Reconectar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Escaneie o QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center p-4">
                        {conn.qr_code_base64 ? (
                          <Image
                            src={conn.qr_code_base64}
                            alt="QR Code"
                            width={250}
                            height={250}
                            className="w-48 h-48"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Clique no botão para gerar o QR Code.
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Botão de remover registro desconectado */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                    onClick={() =>
                      disconnectInstance(conn.id, conn.instance_name, conn.uazapi_token)
                    }
                    disabled={loading}
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
