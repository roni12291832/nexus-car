import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 });
    }

    try {
        const res = await fetch(`${process.env.UAZAPI_BASE_URL}/instance/status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                token: token,
            },
        });

        if (!res.ok) {
            // Instância não existe ou token inválido
            return NextResponse.json({ error: "Instância não encontrada" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
    }
}
