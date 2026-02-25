"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";
import {
    DollarSign, TrendingUp, TrendingDown, Wallet,
    Plus, Trash2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Transaction {
    id: string;
    type: "entrada" | "saida";
    category: string;
    description: string;
    amount: number;
    created_at: string;
}

export default function FinanceiroPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState<"entrada" | "saida" | null>(null);
    const [form, setForm] = useState({ description: "", category: "", amount: "" });

    const fetchTransactions = useCallback(async () => {
        if (!user?.id) return;
        const { data } = await supabase
            .from("financial_transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        setTransactions((data as Transaction[]) || []);
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async () => {
        if (!form.description || !form.amount || !showForm) return;
        const amount = parseFloat(form.amount.replace(",", "."));
        if (isNaN(amount) || amount <= 0) { toast.error("Valor inválido"); return; }

        const { error } = await supabase.from("financial_transactions").insert({
            user_id: user?.id,
            type: showForm,
            category: form.category || (showForm === "entrada" ? "Venda" : "Gasto"),
            description: form.description,
            amount,
        });

        if (error) { toast.error("Erro ao salvar"); return; }
        toast.success(showForm === "entrada" ? "Entrada registrada!" : "Saída registrada!");
        setForm({ description: "", category: "", amount: "" });
        setShowForm(null);
        fetchTransactions();
    };

    const deleteTransaction = async (id: string) => {
        await supabase.from("financial_transactions").delete().eq("id", id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    const entradas = transactions.filter((t) => t.type === "entrada");
    const saidas = transactions.filter((t) => t.type === "saida");
    const totalEntradas = entradas.reduce((s, t) => s + t.amount, 0);
    const totalSaidas = saidas.reduce((s, t) => s + t.amount, 0);
    const lucro = totalEntradas - totalSaidas;

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Painel Financeiro</h1>
                    <p className="text-white/50 text-sm">Acompanhe entradas, saídas e lucro</p>
                </div>
            </div>

            {/* Totais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Total Entradas", value: totalEntradas, icon: TrendingUp, color: "from-green-500 to-emerald-700", text: "text-green-400" },
                    { label: "Total Saídas", value: totalSaidas, icon: TrendingDown, color: "from-red-500 to-red-700", text: "text-red-400" },
                    { label: "Lucro Líquido", value: lucro, icon: Wallet, color: lucro >= 0 ? "from-violet-500 to-blue-700" : "from-red-500 to-red-700", text: lucro >= 0 ? "text-violet-400" : "text-red-400" },
                ].map((card) => (
                    <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-3xl bg-gradient-to-br ${card.color} opacity-20`} />
                        <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${card.color} mb-4`}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className={`text-2xl font-bold ${card.text}`}>{fmt(card.value)}</div>
                        <p className="text-white/40 text-sm mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Entradas */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" /> Entradas
                        </h2>
                        <Button size="sm" onClick={() => setShowForm("entrada")}
                            className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 gap-1">
                            <Plus className="w-3 h-3" /> Adicionar
                        </Button>
                    </div>

                    {showForm === "entrada" && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4 space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-green-400 text-sm font-medium">Nova Entrada</span>
                                <button onClick={() => setShowForm(null)}><X className="w-4 h-4 text-white/40" /></button>
                            </div>
                            <Input placeholder="Descrição (ex: Venda Honda Civic)" value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                            <Input placeholder="Categoria (ex: Venda, Serviço)" value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                            <Input placeholder="Valor (ex: 50000)" value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                            <Button onClick={addTransaction} className="w-full bg-green-500 hover:bg-green-400 text-white">Salvar</Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {loading ? <p className="text-white/30 text-sm">Carregando...</p> : null}
                        {entradas.length === 0 && !loading && <p className="text-white/30 text-sm text-center py-6">Nenhuma entrada registrada</p>}
                        {entradas.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl group">
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{t.description}</p>
                                    <p className="text-white/30 text-xs">{t.category} · {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                    <span className="text-green-400 font-semibold text-sm">+{fmt(t.amount)}</span>
                                    <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Saídas */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-400" /> Saídas
                        </h2>
                        <Button size="sm" onClick={() => setShowForm("saida")}
                            className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 gap-1">
                            <Plus className="w-3 h-3" /> Adicionar
                        </Button>
                    </div>

                    {showForm === "saida" && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-red-400 text-sm font-medium">Nova Saída</span>
                                <button onClick={() => setShowForm(null)}><X className="w-4 h-4 text-white/40" /></button>
                            </div>
                            <Input placeholder="Descrição (ex: Combustível, Aluguel)" value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                            <Input placeholder="Categoria (ex: Fixo, Marketing)" value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                            <Input placeholder="Valor (ex: 1000)" value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                            <Button onClick={addTransaction} className="w-full bg-red-500 hover:bg-red-400 text-white">Salvar</Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {saidas.length === 0 && !loading && <p className="text-white/30 text-sm text-center py-6">Nenhuma saída registrada</p>}
                        {saidas.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl group">
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{t.description}</p>
                                    <p className="text-white/30 text-xs">{t.category} · {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                    <span className="text-red-400 font-semibold text-sm">-{fmt(t.amount)}</span>
                                    <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
