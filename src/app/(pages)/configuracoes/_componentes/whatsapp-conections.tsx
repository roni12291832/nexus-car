"use client";

import { useEffect, useState } from "react";
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
import { QrCode, Wifi, WifiOff, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

type WhatsAppConnection = {
  id: string;
  instance_name: string;
  number?: string;
  status: "conectado" | "desconectado";
  qr_code_base64?: string | null;
  evolution?: string;
};

export default function WhatsAppConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLocalConnections = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("whatsapp_instances")
      .select("*")
      .eq("user_id", user.id);

    if (error)
      return console.error("Erro ao buscar conexões locais:", error.message);
    setConnections(data || []);
  };

  useEffect(() => {
    fetchLocalConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateQr = async (instanceName: string) => {
    try {
      const res = await fetch(`/api/whatsapp/qr?instance=${instanceName}`);
      if (!res.ok) throw new Error("Falha ao gerar QR Code");

      const data = await res.json();

      setConnections((prev) =>
        prev.map((c) =>
          c.instance_name === instanceName
            ? { ...c, qr_code_base64: data.base64 }
            : c
        )
      );

      if (data.number) {
        await supabase
          .from("whatsapp_instances")
          .update({ number: data.number, status: "conectado" })
          .eq("instance_name", instanceName);

        fetchLocalConnections();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectInstance = async (
    instanceId: string,
    instanceName: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/evolution/disconnect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} - ${text}`);
      }

      await supabase
        .from("whatsapp_instances")
        .update({ status: "desconectado", qr_code_base64: null })
        .eq("id", instanceId);

      fetchLocalConnections();
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {connections.map((conn) => (
        <Card key={conn.instance_name} className="shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              {conn.number && (
                <p className="text-sm text-muted-foreground">
                  Número: {conn.number}
                </p>
              )}
              {conn.evolution && (
                <p className="text-sm text-muted-foreground">
                  Evolução: {conn.evolution}
                </p>
              )}
            </div>
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

          <CardContent className="space-y-2">
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
                    disconnectInstance(conn.id, conn.instance_name)
                  }
                  disabled={loading}
                >
                  <LogOut className="w-4 h-4" /> Desconectar
                </Button>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => generateQr(conn.instance_name)}
                  >
                    <QrCode className="w-4 h-4" /> Gerar QR Code
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
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
