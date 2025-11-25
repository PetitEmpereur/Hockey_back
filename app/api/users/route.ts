export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

async function getPrismaClient() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  try {
    return String(error);
  } catch {
    return "Erreur inconnue";
  }
}

export async function POST(req: Request) {
  try {
    const { action, ... data } = await req.json();

    const prisma = await getPrismaClient();
   // --- CRÉATION USER --- 
    try {
      if (action === "create"){
        const user = await prisma.user.create({
          data: {
            ...data,
            dateNaissance: new Date(data.dateNaissance),
          },
        });
        return NextResponse.json({ success: true, user });
      }

// --- LOGIN ---

      if (action === "login") {
      const { email, password } = data;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Utilisateur introuvable" },
          { status: 401 }
        );
      }

      if (user.password !== password) {
        return NextResponse.json(
          { success: false, message: "Mot de passe incorrect" },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true, user });
    }
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/users:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id");

    if (!id) {
      // try JSON body
      try {
        const body = await req.json();
        if (body && (body.id || body.id === 0)) {
          id = String(body.id);
        }
      } catch {
        // ignore JSON parse error; will validate below
      }
    }

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: "Paramètre 'id' manquant ou invalide" }, { status: 400 });
    }

    const prisma = await getPrismaClient();
    try {
      await prisma.user.delete({ where: { id: parseInt(id, 10) } });
      return NextResponse.json({ success: true });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur DELETE /api/users:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const prisma = await getPrismaClient();
    try {
      const users = await prisma.user.findMany();
      return NextResponse.json(users);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/users:", message);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}