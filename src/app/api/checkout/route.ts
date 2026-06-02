import { NextResponse } from "next/server";

// Stripe price IDs - configure these in your Stripe dashboard
const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "",
  yearly: process.env.STRIPE_PRICE_YEARLY || "",
};

export async function POST(request: Request) {
  try {
    const { billingCycle } = await request.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return NextResponse.json({
        message:
          "Stripe no está configurado. Agrega STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY y STRIPE_PRICE_YEARLY a tu .env.local",
        url: null,
      });
    }

    const priceId = billingCycle === "yearly" ? PRICE_IDS.yearly : PRICE_IDS.monthly;

    if (!priceId) {
      return NextResponse.json({
        message: "Price IDs no configurados en .env.local",
        url: null,
      });
    }

    // Create Stripe Checkout session via API
    const baseUrl = request.headers.get("origin") || "http://localhost:3000";

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "subscription",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "success_url": `${baseUrl}/pricing?success=true`,
        "cancel_url": `${baseUrl}/pricing?canceled=true`,
        "metadata[product]": "zennyth_pro",
      }),
    });

    const session = await response.json();

    if (session.error) {
      console.error("Stripe error:", session.error);
      return NextResponse.json(
        { message: session.error.message, url: null },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Error al crear la sesión de pago", url: null },
      { status: 500 }
    );
  }
}
