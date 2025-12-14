import { supabase } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end: number;
};

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout concluído:", session.id);

      const subscriptionId = session.subscription as string | undefined;
      const userId = session.metadata?.user_id;
      const customerId = session.customer as string | undefined;

      if (subscriptionId && userId && session.payment_status === "paid") {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );

          const { error } = await supabase
            .from("users")
            .update({
              subscription_id: customerId,
              status: subscription.status,
              ativo: true,
            })
            .eq("user_id", userId);

          if (error) {
            console.error("Erro ao atualizar usuário no Supabase:", error);
          } else {
            console.log("Assinatura atualizada para user_id:", userId);
          }
        } catch (err) {
          console.error("Erro ao processar checkout:", err);
        }
      } else {
        console.log(
          "Pagamento não concluído, não atualizando usuário:",
          session.id
        );
      }

      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as SubscriptionWithPeriod;

      const userId = subscription.metadata?.user_id;
      if (!userId) break;

      const periodEnd = new Date(
        subscription.current_period_end * 1000
      ).toISOString();

      await supabase.from("users").upsert(
        {
          user_id: userId,
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: periodEnd,
          ativo: true,
        },
        { onConflict: "user_id" }
      );

      console.log("Assinatura criada/atualizada para user_id:", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;
      if (!userId) break;

      await supabase.from("users").upsert(
        {
          user_id: userId,
          subscription_id: subscription.id,
          status: "canceled",
          current_period_end: new Date().toISOString(),
          ativo: false,
        },
        { onConflict: "user_id" }
      );

      console.log("Assinatura cancelada para user_id:", userId);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Pagamento bem-sucedido:", invoice.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Pagamento falhou:", invoice.id);
      break;
    }

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
