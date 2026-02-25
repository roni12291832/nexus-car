import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const instance = req.nextUrl.searchParams.get("instance");
  const token = req.nextUrl.searchParams.get("token");

  if (!instance || !token) {
    return NextResponse.json({ error: "Instance name e token são obrigatórios" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.UAZAPI_BASE_URL}/instance/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
      body: JSON.stringify({}), // No phone = generate QR
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Erro ao conectar à instância (UAZAPI):", err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();

    // UAZAPI returns the QR in the connect response (usually base64 or object)
    // Adjusting to return what the frontend expects (data.base64 or data.qrcode)
    return NextResponse.json({
      base64: data.base64 || data.qrcode || null,
      ...data
    });
  } catch (err) {
    console.error("Erro ao buscar QR Code:", err);
    return NextResponse.json({ error: "Erro ao buscar QR Code" }, { status: 500 });
  }
}
