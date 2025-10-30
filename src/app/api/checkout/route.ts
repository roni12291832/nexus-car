import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  try {
    const { priceId, user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", user_id)
      .single();

    if (error || !user?.email) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      subscription_data: {
        trial_period_days: 14, 
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/obrigado`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancelado`,
      metadata: { user_id },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no checkout" }, { status: 500 });
  }
}
