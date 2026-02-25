"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            console.log("AdminLayout: No user found, redirecting to login");
            router.replace("/admin/login");
            return;
        }

        const checkAdmin = async () => {
            console.log("AdminLayout: Checking admin status for user:", user.id);
            const supabase = createClient();
            const { data: profile, error } = await supabase
                .from("users")
                .select("is_admin")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                console.error("AdminLayout: Database error:", error);
                return;
            }

            if (!profile || !profile.is_admin) {
                console.warn("AdminLayout: Profile not found or not admin");
                await supabase.auth.signOut();
                router.replace("/admin/login");
            } else {
                console.log("AdminLayout: Admin verified successfully");
                setIsAdmin(true);
                setIsVerifying(false);
            }
        };

        checkAdmin();
    }, [user, loading, router]);

    if (loading || isVerifying || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
                <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {children}
        </div>
    );
}
