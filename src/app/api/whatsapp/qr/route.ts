import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const instance = req.nextUrl.searchParams.get("instance");
  if (!instance) {
    return NextResponse.json({ error: "Instance name é obrigatório" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.EVO_API_URL}/instance/connect/${instance}`, {
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EVOLUTION_API_KEY ?? "",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const svgText = await res.text();
    return new Response(svgText, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao buscar QR Code" }, { status: 500 });
  }
}
