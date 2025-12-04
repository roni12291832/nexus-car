"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";

interface Lead {
  id: string;
  name: string;
  phone: string;
}

export default function Leads() {
    const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("dados_cliente")
          .select("id, nomewpp, telefone")
           .eq("whatsapp_id", user?.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar leads:", error.message);
        } else if (data) {
          const mappedLeads: Lead[] = data.map((item) => ({
            id: item.id,
            name: item.nomewpp,
            phone: item.telefone.replace("@s.whatsapp.net", ""),
          }));
          setLeads(mappedLeads);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const callWhatsApp = (lead: Lead) => {
    const phoneRaw = lead.phone.replace(/\D/g, ""); // remove caracteres não numéricos
    const message = `Olá ${lead.name}! Sou da AutoShow Premium. Posso te ajudar com mais informações?`;
    const whatsappUrl = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) return <p>Carregando leads...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>
            Todos os leads captados pelo bot do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => callWhatsApp(lead)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedLead(lead)}
                          >
                            Ver Dados
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Dados do Lead</DialogTitle>
                          </DialogHeader>

                          {selectedLead && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Nome
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedLead.name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Telefone
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedLead.phone}
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
