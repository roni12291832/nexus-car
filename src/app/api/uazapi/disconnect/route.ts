import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { instanceName, token } = await req.json();

    if (!instanceName || !token) {
      return NextResponse.json({ error: "instanceName e token são obrigatórios" }, { status: 400 });
    }

    const response = await fetch(`${process.env.UAZAPI_BASE_URL}/instance/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });

    const text = await response.text();
    console.log("Resposta raw da UAZAPI logout:", text);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro na UAZAPI: ${response.status} - ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desconectar instância na UAZAPI:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
