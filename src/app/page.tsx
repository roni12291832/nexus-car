"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Redirecting from "./redirecting";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase/server";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("Erro ao buscar dados do usuário:", error);
        router.push("/login");
        return;
      }

      if (data.onboarding_completed === false) {
        router.push("/onboarding");
      } else {
        router.push("/home");
      }
    };

    handleRedirect().finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return <Redirecting />;
  }

  return <Redirecting />;
}
