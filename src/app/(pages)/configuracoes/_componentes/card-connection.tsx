"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";

interface CreateInstanceResponse {
  pairingCode?: string;
  code?: string;
  base64?: string;
}

export default function CardConnection() {
  const { user } = useAuth();
  const [instanceName, setInstanceName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CreateInstanceResponse | null>(null);

  const connectWhatsApp = async () => {
    if (!whatsappNumber || !instanceName) return;
    if (user?.id === undefined) return;
    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName,
          number: whatsappNumber,
        }),
      });

      if (!res.ok) throw new Error("Falha ao criar instância");

      const data: CreateInstanceResponse = await res.json();

      const qrRes = await fetch(`/api/whatsapp/qr?instance=${instanceName}`);
      let finalData: CreateInstanceResponse = data;

      if (qrRes.ok) {
        const qrData: CreateInstanceResponse = await qrRes.json();
        finalData = { ...data, ...qrData };
      }

      setResponse(finalData);

      const { error } = await supabase.from("whatsapp_instances").insert({
        instance_name: instanceName,
        phone_number: whatsappNumber,
        pairing_code: finalData.pairingCode || null,
        qr_code_base64: finalData.base64 || null,
        user_id: user.id || null,
        status: "conectado",
      });

      if (error) {
        console.error("Erro ao salvar no Supabase:", error.message);
      } else {
        console.log("Instância salva com sucesso!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!response ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="instance">Nome da Instância</Label>
          <Input
            id="instance"
            placeholder="ex: loja01"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
          />

          <Label htmlFor="phone">Número do WhatsApp</Label>
          <Input
            id="phone"
            placeholder="(11) 99999-9999"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />

          <Button onClick={connectWhatsApp} disabled={loading}>
            {loading ? "Conectando..." : "Conectar"}
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

          <Button onClick={() => setResponse(null)} variant="outline">
            Voltar
          </Button>
        </div>
      )}
    </div>
  );
}
