"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AdminUser = {
    id: string;
    email: string;
    created_at: string;
    confirmed_at: string | null;
    status: string;
    ativo: boolean;
    subscription_id: string | null;
    current_period_end: string | null;
    is_overdue: boolean;
    is_admin: boolean;
    store_name: string | null;
    numero: string | null;
    whatsapp_status: string | null;
    whatsapp_instance: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    active: { label: "Ativo", color: "bg-emerald-900/60 text-emerald-400 border border-emerald-800" },
    trialing: { label: "Trial", color: "bg-blue-900/60 text-blue-400 border border-blue-800" },
    past_due: { label: "Em atraso", color: "bg-amber-900/60 text-amber-400 border border-amber-800" },
    canceled: { label: "Cancelado", color: "bg-red-900/60 text-red-400 border border-red-800" },
    sem_plano: { label: "Sem plano", color: "bg-gray-800 text-gray-500 border border-gray-700" },
};

export default function AdminDashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filtered, setFiltered] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setAccessToken(session.access_token);
            }
        };
        init();
    }, [supabase.auth]);

    const fetchUsers = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
                setFiltered(data);
            }
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        let result = users;
        if (search) {
            result = result.filter(
                (u) =>
                    u.email?.toLowerCase().includes(search.toLowerCase()) ||
                    u.store_name?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filterStatus !== "all") {
            if (filterStatus === "ativo") result = result.filter((u) => u.ativo);
            else if (filterStatus === "inativo") result = result.filter((u) => !u.ativo);
            else result = result.filter((u) => u.status === filterStatus);
        }
        setFiltered(result);
    }, [search, filterStatus, users]);

    const toggleUser = async (userId: string, currentAtivo: boolean) => {
        if (!accessToken) return;
        setActionLoading(userId);
        await fetch("/api/admin/users", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ userId, ativo: !currentAtivo }),
        });
        await fetchUsers();
        setActionLoading(null);
    };

    const deleteUser = async (userId: string, email: string) => {
        if (!accessToken) return;
        if (!window.confirm(`TEM CERTEZA? Isso excluirá permanentemente a conta ${email} e TODOS os dados associados. Esta ação não pode ser desfeita.`)) {
            return;
        }

        setActionLoading(userId);
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                await fetchUsers();
            } else {
                const data = await res.json();
                alert(`Erro ao excluir: ${data.error}`);
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace("/admin/login");
    };

    // Stats
    const total = users.filter((u) => !u.is_admin).length;
    const ativos = users.filter((u) => u.ativo && !u.is_admin).length;
    const vencidos = users.filter((u) => u.is_overdue && u.ativo && !u.is_admin).length;
    const semPlano = users.filter((u) => u.status === "sem_plano" && !u.is_admin).length;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Top bar */}
            <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <span className="font-semibold text-white">NexusCar</span>
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-violet-900 text-violet-300 border border-violet-700">Admin</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchUsers}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                            title="Atualizar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-400 hover:text-red-400 transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Painel de Clientes</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie todos os clientes cadastrados na plataforma</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total de Clientes", value: total, icon: "👥", color: "from-gray-800 to-gray-900", text: "text-white" },
                        { label: "Assinaturas Ativas", value: ativos, icon: "✅", color: "from-emerald-950 to-gray-900", text: "text-emerald-400" },
                        { label: "Mensalidades Vencidas", value: vencidos, icon: "⚠️", color: "from-amber-950 to-gray-900", text: "text-amber-400" },
                        { label: "Sem Plano", value: semPlano, icon: "🚫", color: "from-red-950 to-gray-900", text: "text-red-400" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`rounded-2xl bg-gradient-to-br ${stat.color} border border-gray-800 p-5 space-y-2`}
                        >
                            <span className="text-2xl">{stat.icon}</span>
                            <p className={`text-3xl font-bold ${stat.text}`}>{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Buscar por e-mail ou nome da loja..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                    >
                        <option value="all">Todos os status</option>
                        <option value="ativo">Ativos</option>
                        <option value="inativo">Desativados</option>
                        <option value="active">Assinatura ativa</option>
                        <option value="past_due">Em atraso</option>
                        <option value="canceled">Cancelado</option>
                        <option value="sem_plano">Sem plano</option>
                    </select>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-800 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-24 text-gray-600">
                            <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Carregando clientes...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-900 border-b border-gray-800">
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filtered.filter((u) => !u.is_admin).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16 text-gray-600">
                                                Nenhum cliente encontrado
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered
                                            .filter((u) => !u.is_admin)
                                            .map((user) => {
                                                const status = STATUS_LABELS[user.status] ?? STATUS_LABELS.sem_plano;
                                                const periodEnd = user.current_period_end
                                                    ? new Date(user.current_period_end)
                                                    : null;
                                                return (
                                                    <tr key={user.id} className="bg-gray-950 hover:bg-gray-900/50 transition group">
                                                        <td className="px-4 py-4">
                                                            <div>
                                                                <p className="font-medium text-white truncate max-w-[200px]">{user.email}</p>
                                                                {user.store_name && (
                                                                    <p className="text-xs text-gray-500 mt-0.5">🏪 {user.store_name}</p>
                                                                )}
                                                                <p className="text-xs text-gray-700 mt-0.5">
                                                                    Cadastro: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                            {user.is_overdue && user.ativo && (
                                                                <span className="block text-xs text-amber-500 mt-1">Vencido</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-400 text-xs">
                                                            {periodEnd ? (
                                                                <span className={user.is_overdue ? "text-red-400" : "text-gray-400"}>
                                                                    {periodEnd.toLocaleDateString("pt-BR")}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-700">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {user.whatsapp_status === "conectado" ? (
                                                                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                                                    Conectado
                                                                </span>
                                                            ) : user.whatsapp_instance ? (
                                                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                                    <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
                                                                    Desconectado
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-700">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-400 text-xs">
                                                            {user.numero ? (
                                                                <a
                                                                    href={`https://wa.me/55${user.numero.replace(/\D/g, "")}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition"
                                                                >
                                                                    📱 {user.numero}
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-700">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => toggleUser(user.id, user.ativo)}
                                                                    disabled={actionLoading === user.id}
                                                                    className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${user.ativo
                                                                        ? "border-red-800 text-red-500 hover:bg-red-950"
                                                                        : "border-emerald-800 text-emerald-500 hover:bg-emerald-950"
                                                                        } disabled:opacity-40`}
                                                                >
                                                                    {user.ativo ? "Suspender" : "Reativar"}
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteUser(user.id, user.email)}
                                                                    disabled={actionLoading === user.id}
                                                                    className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-gray-400 hover:text-red-500 hover:bg-red-950/30 transition disabled:opacity-40"
                                                                    title="Excluir Permanentemente"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-800 pb-4">
                    NexusCar Admin — {filtered.filter((u) => !u.is_admin).length} de {total} clientes exibidos
                </p>
            </main>
        </div>
    );
}
