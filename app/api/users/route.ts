export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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
        // if a password is provided, hash it before storing
        if (data.password) {
          data.password = await bcrypt.hash(String(data.password), 10);
        }

        const user = await prisma.user.create({
          data: {
            ...data,
            dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
          },
        });
        return NextResponse.json({ success: true, user });
      }

// --- LOGIN ---

  if (action === "login") {
    const { identifier, password } = data;
    const cleanIdentifier = String(identifier).trim();

    let user;

    if (cleanIdentifier.includes("@")) {
    user = await prisma.user.findUnique({
      where: { email: cleanIdentifier },
      select: {
        id: true,
        nom: true,
        prenom: true,
        countryCode: true,
        email: true,
        phoneNumber: true,
        dateNaissance: true,
        info: true,
        role: true,
        substituer: true,
        suspension: true,
        createdAt: true,
        password: true,
      },
    });
  } 

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Utilisateur introuvable" },
          { status: 401 }
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { success: false, message: "Mot de passe non défini pour cet utilisateur" },
          { status: 401 }
        );
      }

      const passwordMatches = await bcrypt.compare(String(password), user.password);
      if (!passwordMatches) {
        return NextResponse.json(
          { success: false, message: "Mot de passe incorrect" },
          { status: 401 }
        );
      }

      const { password: _pw, ...userSafe } = user;
      return NextResponse.json({ success: true, user: userSafe });
    }
      return NextResponse.json(
        { success: false, message: "Action inconnue" },
        { status: 400 }
      );


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