"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Car, TrendingUp, Wifi, WifiOff,
  Clock, ArrowUpRight, MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  nomewpp: string;
  telefone: string;
  created_at: string;
  crm_status?: string;
}

const statusColors: Record<string, string> = {
  novo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  negociando: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  fechado: "bg-green-500/20 text-green-400 border-green-500/30",
  perdido: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalEstoque, setTotalEstoque] = useState(0);
  const [crmCounts, setCrmCounts] = useState({ novo: 0, negociando: 0, fechado: 0, perdido: 0 });

  useEffect(() => {
    if (!user?.id) return;
    const fetchAll = async () => {
      const [
        { data: wppData },
        { data: storeData },
        { data: leadsData },
        { count: estoqueCount },
      ] = await Promise.all([
        supabase.from("whatsapp_instances").select("status").eq("user_id", user.id).limit(1).single(),
        supabase.from("store_settings").select("store_name").eq("user_id", user.id).single(),
        supabase.from("dados_cliente").select("id, nomewpp, telefone, created_at, crm_status")
          .eq("whatsapp_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("carros").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      setWhatsappConnected(wppData?.status === "conectado");
      setStoreName(storeData?.store_name || "");
      setTotalEstoque(estoqueCount ?? 0);

      if (leadsData) {
        setLeads(leadsData);
        const counts = { novo: 0, negociando: 0, fechado: 0, perdido: 0 };
        leadsData.forEach((l: Lead) => {
          const s = l.crm_status || "novo";
          if (s in counts) counts[s as keyof typeof counts]++;
        });
        setCrmCounts(counts);
      }
    };
    fetchAll();
  }, [user?.id]);

  const stats = [
    { title: "Leads Novos", value: crmCounts.novo, icon: Users, color: "from-blue-500 to-blue-700", sub: "aguardando atendimento" },
    { title: "Em Negociação", value: crmCounts.negociando, icon: TrendingUp, color: "from-yellow-500 to-orange-600", sub: "em andamento" },
    { title: "Estoque", value: totalEstoque, icon: Car, color: "from-violet-500 to-purple-700", sub: "veículos disponíveis" },
    {
      title: "WhatsApp",
      value: whatsappConnected ? "Ativo" : "Offline",
      icon: whatsappConnected ? Wifi : WifiOff,
      color: whatsappConnected ? "from-green-500 to-emerald-700" : "from-red-500 to-red-700",
      sub: whatsappConnected ? "IA de Atendimento funcionando" : "conecte seu número",
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {storeName || "bem-vindo"}! 👋
          </h1>
          <p className="text-white/50 text-sm mt-1">Aqui está o resumo do seu negócio hoje</p>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-3xl bg-gradient-to-br ${s.color} opacity-20`} />
            <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${s.color} mb-3`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm font-medium text-white/70 mt-0.5">{s.title}</div>
            <div className="text-xs text-white/30 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Recentes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Leads Recentes</h2>
            <Link href="/leads" className="text-violet-400 text-xs flex items-center gap-1 hover:text-violet-300 transition-colors">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {leads.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Nenhum lead ainda</p>
            )}
            {leads.map((lead) => {
              const initials = (lead.nomewpp || "?").slice(0, 2).toUpperCase();
              const phone = (lead.telefone || "").replace("@s.whatsapp.net", "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
              const status = lead.crm_status || "novo";
              return (
                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{lead.nomewpp || "Sem nome"}</p>
                    <p className="text-white/40 text-xs">{phone}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[status] || statusColors.novo}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funil de Vendas */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Funil de Vendas</h2>
            <Link href="/leads" className="text-violet-400 text-xs flex items-center gap-1 hover:text-violet-300 transition-colors">
              CRM <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { label: "Novos", key: "novo", color: "bg-blue-500", icon: "🆕" },
              { label: "Em Negociação", key: "negociando", color: "bg-yellow-500", icon: "🤝" },
              { label: "Fechados", key: "fechado", color: "bg-green-500", icon: "✅" },
              { label: "Perdidos", key: "perdido", color: "bg-red-500", icon: "❌" },
            ].map((stage) => {
              const total = Object.values(crmCounts).reduce((a, b) => a + b, 0) || 1;
              const val = crmCounts[stage.key as keyof typeof crmCounts];
              const pct = Math.round((val / total) * 100);
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm">{stage.icon} {stage.label}</span>
                    <span className="text-white font-semibold text-sm">{val}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp status */}
          <div className={`mt-6 p-3 rounded-xl flex items-center gap-3 ${whatsappConnected ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
            <MessageSquare className={`w-4 h-4 ${whatsappConnected ? "text-green-400" : "text-red-400"}`} />
            <p className="text-sm text-white/70">
              IA de Atendimento {whatsappConnected ? <span className="text-green-400 font-medium">ativa e funcionando</span> : <span className="text-red-400 font-medium">offline — <Link href="/whatsapp" className="underline">conecte agora</Link></span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
