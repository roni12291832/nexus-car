"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function SubscribeButton({ priceId }: { priceId: string }) {
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      alert("Você precisa estar logado para assinar!");
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        user_id: user.id, 
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Erro no checkout");
      return;
    }

    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <Button
      onClick={handleCheckout}
      className="w-full text-white rounded bg-[#372b82]"
    >
      Assinar
    </Button>
  );
}
