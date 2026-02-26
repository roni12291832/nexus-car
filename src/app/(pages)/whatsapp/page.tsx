"use client";

import WhatsAppConnections from "@/app/(pages)/configuracoes/_componentes/whatsapp-conections";
import CardConnection from "@/app/(pages)/configuracoes/_componentes/card-connection";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function WhatsAppPage() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Conecte seu WhatsApp</h1>
                        <p className="text-sm text-white/50">Gerencie os números conectados à sua IA de Atendimento</p>
                    </div>
                </div>

                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0 shadow-lg gap-2">
                            <Plus className="w-4 h-4" />
                            Adicionar número
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md bg-[#13141a] border border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Conectar WhatsApp</DialogTitle>
                            <DialogDescription className="text-white/50">
                                Escaneie o QR Code com seu WhatsApp para ativar a IA de Atendimento.
                            </DialogDescription>
                        </DialogHeader>
                        <CardConnection onSuccess={() => {
                            setShowModal(false);
                            toast.success("✅ WhatsApp conectado!", {
                                description: "Seu número está pronto para receber leads.",
                                duration: 5000,
                            });
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Instruções */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { step: "1", title: "Clique em Adicionar", desc: "Clique no botão acima para iniciar o processo de conexão do seu WhatsApp." },
                    { step: "2", title: "Escaneie o QR Code", desc: "Abra o WhatsApp no celular, vá em Dispositivos Conectados e escaneie o código." },
                    { step: "3", title: "IA de Atendimento ativada!", desc: "Assim que conectar, a IA de Atendimento começa a atender seus clientes automaticamente." },
                ].map((item) => (
                    <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold mb-3">
                            {item.step}
                        </div>
                        <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                        <p className="text-white/50 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Conexões ativas */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Números conectados</h2>
                <WhatsAppConnections />
            </div>
        </div>
    );
}
