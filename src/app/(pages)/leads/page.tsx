"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Plus, Search, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Carro {
  id: string;
  name: string;
  model: string;
  year: number;
}

interface Lead {
  id: string;
  nomewpp: string;
  lead_name: string;
  lead_field01: string; // carro interessado
  telefone: string;
  created_at: string;
  crm_status: string;
}

type CrmStatus = "novo" | "negociando" | "fechado" | "perdido";

const COLUMNS: { key: CrmStatus; label: string; color: string; bg: string; dot: string }[] = [
  { key: "novo", label: "🆕 Novos", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
  { key: "negociando", label: "🤝 Em Negociação", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", dot: "bg-yellow-400" },
  { key: "fechado", label: "✅ Fechados", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", dot: "bg-green-400" },
  { key: "perdido", label: "❌ Perdidos", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
];

// Ícone WhatsApp SVG
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");

  const [carros, setCarros] = useState<Carro[]>([]);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [leadForm, setLeadForm] = useState({
    name: "",
    telefone: "",
    veiculosSelecionados: [] as string[],
    outroVeiculo: "",
  });

  const fetchLeads = useCallback(async () => {
    if (!user?.id) return;

    // Tenta buscar com as colunas novas primeiro
    let { data, error } = await supabase
      .from("dados_cliente")
      .select("id, nomewpp, lead_name, lead_field01, telefone, created_at, crm_status")
      .eq("whatsapp_id", user.id)
      .order("created_at", { ascending: false });

    // Se falhar porque as colunas não existem, faz fallback para as antigas
    if (error && error.message.includes("does not exist")) {
      const fallback = await supabase
        .from("dados_cliente")
        .select("id, nomewpp, telefone, created_at, crm_status")
        .eq("whatsapp_id", user.id)
        .order("created_at", { ascending: false });
      data = fallback.data as any;
    }

    setLeads(
      (data || []).map((l: any) => ({
        ...l,
        crm_status: l.crm_status || "novo",
        telefone: (l.telefone || "").replace("@s.whatsapp.net", ""),
      }))
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchLeads();
    if (user?.id) {
      supabase.from("store_settings").select("store_name").eq("user_id", user.id).single()
        .then(({ data }) => setStoreName(data?.store_name || ""));
      supabase.from("estoque").select("id, name, model, year").eq("user_id", user.id).eq("status", "Disponível")
        .then(({ data }) => setCarros(data || []));
    }

    // Realtime: atualiza quando o Supabase recebe dados novos do N8N
    const channel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "dados_cliente",
      }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchLeads, user?.id]);

  const moveCard = async (leadId: string, newStatus: CrmStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, crm_status: newStatus } : l))
    );
    await supabase.from("dados_cliente").update({ crm_status: newStatus }).eq("id", leadId);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const msg = `Olá ${name || ""}! Sou da ${storeName}. Posso te ajudar?`;
    const clean = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const formatPhone = (tel: string) => {
    const clean = tel.replace(/\D/g, "");
    const local = clean.startsWith("55") ? clean.slice(2) : clean;
    return local.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") || tel;
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.nomewpp?.toLowerCase().includes(q) ||
      l.lead_name?.toLowerCase().includes(q) ||
      l.telefone?.includes(q) ||
      l.lead_field01?.toLowerCase().includes(q)
    );
  });

  const getColumn = (status: CrmStatus) => filtered.filter((l) => l.crm_status === status);

  const openNewLead = () => {
    setLeadForm({ name: "", telefone: "", veiculosSelecionados: [], outroVeiculo: "" });
    setIsNewLeadOpen(true);
  };

  const openEditLead = (lead: Lead) => {
    setSelectedLead(lead);

    // Parse existing vehicles
    const existingInterest = lead.lead_field01 || "";
    const vehiclesArr = existingInterest.split(', ').filter(v => v);

    // Try to match existing names with available cars
    const matchedIds: string[] = [];
    const unmatchedNames: string[] = [];

    vehiclesArr.forEach(vName => {
      const match = carros.find(c => `${c.name} ${c.model}` === vName);
      if (match) {
        matchedIds.push(match.id);
      } else {
        unmatchedNames.push(vName);
      }
    });

    setLeadForm({
      name: lead.lead_name || lead.nomewpp || "",
      telefone: lead.telefone || "",
      veiculosSelecionados: matchedIds,
      outroVeiculo: unmatchedNames.join(', '),
    });
    setIsEditLeadOpen(true);
  };

  const saveLead = async () => {
    if (!leadForm.name || !leadForm.telefone) {
      toast.error("Nome e telefone são obrigatórios.");
      return;
    }

    const unformattedPhone = leadForm.telefone.replace(/\D/g, "");

    // Build lead_field01 string
    const selectedCarNames = carros
      .filter(c => leadForm.veiculosSelecionados.includes(c.id))
      .map(c => `${c.name} ${c.model}`);

    const allInterests = [...selectedCarNames];
    if (leadForm.outroVeiculo.trim()) {
      allInterests.push(leadForm.outroVeiculo.trim());
    }
    const leadField01 = allInterests.join(', ');

    if (selectedLead) {
      // Edit
      const { error } = await supabase
        .from("dados_cliente")
        .update({
          nomewpp: leadForm.name,
          lead_name: leadForm.name,
          telefone: unformattedPhone,
          lead_field01: leadField01,
        })
        .eq("id", selectedLead.id);

      if (error && error.message.includes("column")) {
        // Fallback for missing columns
        await supabase.from("dados_cliente").update({ nomewpp: leadForm.name, telefone: unformattedPhone }).eq("id", selectedLead.id);
        toast.warning("Colunas 'lead_name' e 'lead_field01' ausentes no banco. Apenas nome e telefone atualizados. Acesse o Supabase e adicione-as as na tabela dados_cliente para salvar os veículos.", { duration: 8000 });
        setIsEditLeadOpen(false);
        fetchLeads();
      } else if (error) {
        toast.error("Erro ao atualizar lead.");
      } else {
        toast.success("Lead atualizado!");
        setIsEditLeadOpen(false);
        fetchLeads();
      }
    } else {
      // Create new
      if (!user?.id) return;
      const payload: any = {
        whatsapp_id: user.id,
        nomewpp: leadForm.name,
        lead_name: leadForm.name,
        telefone: unformattedPhone,
        lead_field01: leadField01,
        crm_status: "novo",
      };

      const { error } = await supabase.from("dados_cliente").insert(payload);

      if (error && error.message.includes("column")) {
        // Fallback
        delete payload.lead_name;
        delete payload.lead_field01;
        await supabase.from("dados_cliente").insert(payload);
        toast.warning("Lead criado! Porém, para salvar veículos de interesse, adicione as colunas 'lead_name' e 'lead_field01' no seu Supabase.", { duration: 8000 });
        setIsNewLeadOpen(false);
        fetchLeads();
      } else if (error) {
        toast.error("Erro ao criar lead.");
      } else {
        toast.success("Lead criado!");
        setIsNewLeadOpen(false);
        fetchLeads();
      }
    }
  };

  const toggleVeiculo = (carId: string) => {
    setLeadForm(prev => {
      const current = prev.veiculosSelecionados;
      if (current.includes(carId)) {
        return { ...prev, veiculosSelecionados: current.filter(id => id !== carId) };
      }
      return { ...prev, veiculosSelecionados: [...current, carId] };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pipeline de Leads</h1>
            <p className="text-white/50 text-sm">
              {leads.length} leads · Arraste para mover entre etapas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={openNewLead} className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white border-0 shadow-lg text-sm h-10">
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Lead Manual
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Buscar por nome, carro ou número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 w-72"
            />
          </div>
        </div>
      </div>

      {/* Column counts */}
      <div className="flex gap-4 flex-wrap">
        {COLUMNS.map((col) => (
          <span key={col.key} className="flex items-center gap-1.5 text-sm text-white/60">
            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
            {getColumn(col.key).length} {col.label.replace(/^.+? /, "")}
          </span>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[60vh]">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`border rounded-2xl p-4 space-y-3 transition-all duration-200 ${col.bg} ${dragging ? "border-dashed" : ""}`}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging) moveCard(dragging, col.key);
              setDragging(null);
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
              <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                {getColumn(col.key).length}
              </span>
            </div>

            {getColumn(col.key).map((lead) => {
              // Nome prioriza nome identificado na conversa; fallback para nome do WhatsApp
              const displayName = lead.lead_name || lead.nomewpp || "Sem nome";
              const initials = displayName.slice(0, 2).toUpperCase();
              const date = new Date(lead.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "short",
              });
              const phoneFormatted = formatPhone(lead.telefone);
              const carInteresse = lead.lead_field01;

              return (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragging(lead.id)}
                  onDragEnd={() => setDragging(null)}
                  onClick={() => openEditLead(lead)}
                  className="bg-[#13141a] border border-white/10 rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-violet-500/40 transition-all group"
                >
                  {/* Avatar + Nome */}
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                      {/* Número único */}
                      <p className="text-white/40 text-xs font-mono">{phoneFormatted}</p>
                    </div>
                  </div>

                  {/* Carro interessado */}
                  {carInteresse && (
                    <div className="flex items-center gap-1.5 mb-2.5 bg-violet-500/10 rounded-lg px-2.5 py-1.5">
                      <Car className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span className="text-violet-300 text-xs truncate">{carInteresse}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">{date}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-[#25D366] hover:bg-[#25D366]/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsApp(lead.telefone, displayName);
                      }}
                      title="Abrir no WhatsApp"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {getColumn(col.key).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-white/20">
                <Plus className="w-8 h-8 mb-2" />
                <p className="text-xs">Arraste leads aqui</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Lead (Novo / Editar) */}
      <Dialog open={isNewLeadOpen || isEditLeadOpen} onOpenChange={(open) => {
        if (!open) {
          setIsNewLeadOpen(false);
          setIsEditLeadOpen(false);
          setSelectedLead(null);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-[#13141a] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{isEditLeadOpen ? "Editar Lead" : "Cadastrar Lead Manual"}</DialogTitle>
            <DialogDescription className="text-white/50">
              {isEditLeadOpen ? "Edite as informações do lead e seus veículos de interesse." : "Adicione manualmente clientes que visitaram a loja ou contataram por outro canal."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome do Lead</Label>
              <Input
                placeholder="Ex: João Silva"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input
                placeholder="Ex: (86) 99999-9999"
                value={leadForm.telefone}
                onChange={(e) => setLeadForm({ ...leadForm, telefone: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Veículos de Interesse (Estoque)</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {carros.length === 0 ? (
                  <p className="text-xs text-white/40 col-span-2">Nenhum carro disponível no estoque.</p>
                ) : (
                  carros.map(car => (
                    <div
                      key={car.id}
                      onClick={() => toggleVeiculo(car.id)}
                      className={`cursor-pointer border rounded-md p-2 text-xs transition-colors ${leadForm.veiculosSelecionados.includes(car.id)
                        ? "bg-violet-500/20 border-violet-500 text-violet-200"
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                        }`}
                    >
                      <span className="font-semibold">{car.name}</span> {car.model}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Outro Veículo (Não listado / Avulso)</Label>
              <Input
                placeholder="Ex: Hilux SRX 2024 Branca"
                value={leadForm.outroVeiculo}
                onChange={(e) => setLeadForm({ ...leadForm, outroVeiculo: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>

            <Button onClick={saveLead} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
              {isEditLeadOpen ? "Salvar Alterações" : "Cadastrar Lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
