"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import { QrCode } from "lucide-react";

interface CreateInstanceResponse {
  pairingCode?: string;
  base64?: string;
  ownerJid?: string;
}

export default function CardConnection() {
  const { user } = useAuth();
  const instanceName = user?.id || "";

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CreateInstanceResponse | null>(null);

  const connectWhatsApp = async () => {
    if (!instanceName) return;
    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName }),
      });

      if (!res.ok) throw new Error("Falha ao criar instância");

      const data = await res.json() as Record<string, unknown>; // UazapiInstanceResponse
      const token = data.token as string | undefined;

      // 2. Get QR Code
      const qrRes = await fetch(`/api/whatsapp/qr?instance=${instanceName}&token=${token}`);
      let finalData = data;

      if (qrRes.ok) {
        const qrData = await qrRes.json();
        finalData = { ...data, ...qrData };
      }

      const { error } = await supabase.from("whatsapp_instances").insert({
        instance_name: instanceName,
        pairing_code: finalData.pairingCode || null,
        qr_code_base64: finalData.base64 || finalData.qrcode || null,
        number: finalData.number || null,
        user_id: user?.id || null,
        status: "conectado",
        token: token, // Storing the vital UAZAPI token
      });

      if (error) {
        console.error("Erro ao salvar no Supabase:", error.message);
      } else {
        console.log("Instância salva com sucesso!");
      }

      setResponse(finalData);
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!response ? (
        <div className="flex flex-col gap-2">
          <Button onClick={connectWhatsApp} disabled={loading || !instanceName}>
            <QrCode />
            {loading ? "Gerando..." : "Gerar QR Code"}
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          {response.pairingCode && (
            <div>
              <p className="font-bold text-lg">Código de Pareamento:</p>
              <p className="text-2xl text-green-600">{response.pairingCode}</p>
            </div>
          )}

          {response.base64 && (
            <div className="mx-auto">
              <Image
                src={response.base64}
                alt="QR Code"
                width={250}
                height={250}
                className="mx-auto"
              />
            </div>
          )}

          {response.ownerJid && (
            <p className="text-sm text-muted-foreground">
              Número: {response.ownerJid.split("@")[0]}
            </p>
          )}

          <Button onClick={() => setResponse(null)} variant="outline">
            Voltar
          </Button>
        </div>
      )}
    </div>
  );
}
