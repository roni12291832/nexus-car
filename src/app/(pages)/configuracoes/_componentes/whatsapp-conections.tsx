"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Wifi, WifiOff } from "lucide-react";

type WhatsAppConnection = {
  id: string;
  name: string;
  status: "connected" | "disconnected";
};

const mockConnections: WhatsAppConnection[] = [
  { id: "1", name: "WhatsApp Suporte", status: "connected" },
  { id: "2", name: "WhatsApp Comercial", status: "disconnected" },
];

export default function WhatsAppConnections() {
  const [connections] = useState<WhatsAppConnection[]>(mockConnections);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {connections.map((conn) => (
        <Card key={conn.id} className="shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{conn.name}</CardTitle>
            {conn.status === "connected" ? (
              <Badge className="flex items-center gap-1">
                <Wifi className="w-4 h-4" /> Conectado
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="w-4 h-4" /> Desconectado
              </Badge>
            )}
          </CardHeader>

          <CardContent>
            {conn.status === "connected" ? (
              <p className="text-sm text-muted-foreground">
                Este WhatsApp está ativo.
              </p>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" /> Gerar QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Escaneie o QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center p-4">
                    {/* <QRCodeCanvas
                      value={`whatsapp-connection-${conn.id}`}
                      size={200}
                    /> */}
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
