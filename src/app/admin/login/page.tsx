"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !data.session) {
            setError("Credenciais inválidas. Verifique seu e-mail e senha.");
            setLoading(false);
            return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from("users")
            .select("is_admin")
            .eq("user_id", data.user.id)
            .single();

        if (!profile?.is_admin) {
            await supabase.auth.signOut();
            setError("Acesso negado. Este usuário não tem permissões de admin.");
            setLoading(false);
            return;
        }

        router.push("/admin");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="w-full max-w-sm space-y-8 p-8">
                {/* Logo / Brand */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-900 shadow-2xl mb-2">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">NexusCar Admin</h1>
                    <p className="text-sm text-gray-500">Painel exclusivo para administradores</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="px-4 py-3 rounded-lg bg-red-950 border border-red-800 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@nexuscar.com.br"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Verificando...
                            </span>
                        ) : (
                            "Entrar como Admin"
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-700">
                    Acesso restrito — apenas administradores autorizados
                </p>
            </div>
        </div>
    );
}
