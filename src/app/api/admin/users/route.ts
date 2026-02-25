import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
        .from("users")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: authUsers, error: authListError } = await supabaseAdmin.auth.admin.listUsers();

    if (authListError) {
        return NextResponse.json({ error: authListError.message }, { status: 500 });
    }

    const { data: profiles } = await supabaseAdmin
        .from("users")
        .select("user_id, status, ativo, subscription_id, current_period_end, is_admin");

    const { data: storeSettings } = await supabaseAdmin
        .from("store_settings")
        .select("user_id, store_name, numero");

    const { data: whatsappInstances } = await supabaseAdmin
        .from("whatsapp_instances")
        .select("user_id, instance_name, status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storeMap = new Map(storeSettings?.map((s: any) => [s.user_id, s]) ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whatsappMap = new Map(whatsappInstances?.map((w: any) => [w.user_id, w]) ?? []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = authUsers.users.map((authUser: any) => {
        const p = profileMap.get(authUser.id);
        const s = storeMap.get(authUser.id);
        const w = whatsappMap.get(authUser.id);

        const periodEnd = p?.current_period_end
            ? new Date(p.current_period_end)
            : null;
        const isOverdue = periodEnd ? periodEnd < new Date() : false;

        return {
            id: authUser.id,
            email: authUser.email,
            created_at: authUser.created_at,
            confirmed_at: authUser.email_confirmed_at,
            status: p?.status ?? "sem_plano",
            ativo: p?.ativo ?? false,
            subscription_id: p?.subscription_id ?? null,
            current_period_end: p?.current_period_end ?? null,
            is_overdue: isOverdue,
            is_admin: p?.is_admin ?? false,
            store_name: s?.store_name ?? null,
            numero: s?.numero ?? null,
            whatsapp_status: w?.status ?? null,
            whatsapp_instance: w?.instance_name ?? null,
        };
    });

    return NextResponse.json(users);
}

export async function PATCH(req: Request) {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabaseAdmin.from("users").select("is_admin").eq("user_id", user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { userId, ativo } = body;

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("users")
        .update({ ativo })
        .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabaseAdmin.from("users").select("is_admin").eq("user_id", user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (userId === user.id) return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
