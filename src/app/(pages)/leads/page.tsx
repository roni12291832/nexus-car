"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Phone, Users, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  nomewpp: string;
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

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");

  const fetchLeads = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("dados_cliente")
      .select("id, nomewpp, telefone, created_at, crm_status")
      .eq("whatsapp_id", user.id)
      .order("created_at", { ascending: false });
    setLeads(
      (data || []).map((l) => ({
        ...l,
        crm_status: l.crm_status || "novo",
        telefone: (l.telefone || "").replace("@s.whatsapp.net", ""),
      }))
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchLeads();
    supabase.from("store_settings").select("store_name").eq("user_id", user?.id || "").single()
      .then(({ data }) => setStoreName(data?.store_name || ""));
  }, [fetchLeads, user?.id]);

  const moveCard = async (leadId: string, newStatus: CrmStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, crm_status: newStatus } : l))
    );
    await supabase.from("dados_cliente").update({ crm_status: newStatus }).eq("id", leadId);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const msg = `Olá ${name}! Sou da ${storeName}. Posso te ajudar?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filtered = leads.filter((l) =>
    l.nomewpp?.toLowerCase().includes(search.toLowerCase()) ||
    l.telefone?.includes(search)
  );

  const getColumn = (status: CrmStatus) => filtered.filter((l) => l.crm_status === status);

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Buscar lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 w-56"
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
              const initials = (lead.nomewpp || "?").slice(0, 2).toUpperCase();
              const date = new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
              const phone = lead.telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

              return (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragging(lead.id)}
                  onDragEnd={() => setDragging(null)}
                  className="bg-[#13141a] border border-white/10 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-violet-500/40 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{lead.nomewpp || "Sem nome"}</p>
                      <p className="text-white/40 text-xs">{phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">{date}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
                        onClick={() => openWhatsApp(lead.telefone, lead.nomewpp)}
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-blue-400 hover:bg-blue-500/20"
                        onClick={() => window.open(`tel:${lead.telefone.replace(/\D/g, "")}`, "_blank")}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
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
    </div>
  );
}
