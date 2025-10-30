// src/app/api/evolution/disconnect/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { instanceName } = await req.json();

    if (!instanceName) {
      return NextResponse.json({ error: "instanceName é obrigatório" }, { status: 400 });
    }

    const response = await fetch(`${process.env.EVO_API_URL}/instance/logout/${instanceName}`, {
      method: "DELETE",
      headers: {
        apikey: process.env.EVOLUTION_API_KEY ?? "",
      },
    });

    const text = await response.text();
    console.log("Resposta raw da Evolution logout:", text);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro na Evolution: ${response.status} - ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desconectar instância na Evolution:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
