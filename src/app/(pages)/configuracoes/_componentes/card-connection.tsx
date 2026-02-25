"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import { QrCode, CheckCircle, Loader2 } from "lucide-react";

interface CreateInstanceResponse {
  pairingCode?: string;
  base64?: string;
  qrcode?: string;
  ownerJid?: string;
  token?: string;
}

interface CardConnectionProps {
  onSuccess?: () => void;
}

export default function CardConnection({ onSuccess }: CardConnectionProps) {
  const { user } = useAuth();
  const instanceName = user?.id || "";

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CreateInstanceResponse | null>(null);
  const [connected, setConnected] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Polling de status: verifica se o WhatsApp foi conectado
  const startPolling = useCallback((token: string) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/whatsapp/status?token=${token}`);
        if (!res.ok) {
          stopPolling();
          return;
        }
        const data = await res.json() as { status?: { connected?: boolean } };
        if (data?.status?.connected === true) {
          stopPolling();
          setConnected(true);

          // Atualiza status no Supabase
          await supabase
            .from("whatsapp_instances")
            .update({ status: "conectado" })
            .eq("instance_name", instanceName);

          // Chama callback de sucesso no pai (fecha dialog + mostra toast)
          onSuccess?.();

          // Fecha a tela do QR após 1.5s
          setTimeout(() => {
            setResponse(null);
            setConnected(false);
          }, 1500);
        }
      } catch {
        stopPolling();
      }
    }, 4000); // Verifica a cada 4 segundos
  }, [instanceName, stopPolling]);

  // Limpa polling ao desmontar
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const connectWhatsApp = async () => {
    if (!instanceName) return;
    setLoading(true);
    setConnected(false);

    try {
      const res = await fetch("/api/whatsapp/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName }),
      });

      if (!res.ok) throw new Error("Falha ao criar instância");

      const data = await res.json() as Record<string, unknown>;
      const token = data.token as string | undefined;

      let finalData = data;

      // Busca QR se não veio no retorno do N8N
      if (!data.base64 && !data.qrcode && token) {
        const qrRes = await fetch(`/api/whatsapp/qr?instance=${instanceName}&token=${token}`);
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          finalData = { ...data, ...qrData };
        }
      }

      type InstanceData = Record<string, string | null | boolean | undefined>;
      const { error } = await supabase.from("whatsapp_instances").upsert({
        instance_name: instanceName,
        pairing_code: finalData.pairingCode || null,
        qr_code_base64: finalData.base64 || (finalData as InstanceData).qrcode || null,
        number: finalData.number || null,
        user_id: user?.id || null,
        status: "aguardando",
        uazapi_token: token,
      }, { onConflict: "instance_name" });

      if (error) {
        console.error("Erro ao salvar no Supabase:", error.message);
      }

      setResponse({ ...finalData as CreateInstanceResponse, token });

      // Inicia polling para detectar quando o WhatsApp estiver conectado
      if (token) {
        startPolling(token);
      }
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error);
    } finally {
      setLoading(false);
    }
  };

  const qrSrc = response?.base64 || response?.qrcode;

  return (
    <div className="space-y-4">
      {!response ? (
        <div className="flex flex-col gap-2">
          <Button onClick={connectWhatsApp} disabled={loading || !instanceName}>
            {loading ? <Loader2 className="animate-spin" /> : <QrCode />}
            {loading ? "Gerando..." : "Adicionar WhatsApp"}
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          {connected ? (
            // Tela de sucesso — fecha automaticamente
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
              <p className="text-green-600 font-semibold text-lg">WhatsApp Conectado! ✅</p>
              <p className="text-sm text-muted-foreground">Sua conta foi ativada com sucesso.</p>
            </div>
          ) : (
            <>
              {response.pairingCode && (
                <div>
                  <p className="font-bold text-lg">Código de Pareamento:</p>
                  <p className="text-2xl text-green-600">{response.pairingCode}</p>
                </div>
              )}

              {qrSrc && (
                <div className="mx-auto relative">
                  <Image
                    src={qrSrc}
                    alt="QR Code"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Aguardando conexão...
                  </div>
                </div>
              )}

              {response.ownerJid && (
                <p className="text-sm text-muted-foreground">
                  Número: {response.ownerJid.split("@")[0]}
                </p>
              )}

              <Button
                onClick={() => { stopPolling(); setResponse(null); }}
                variant="outline"
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
