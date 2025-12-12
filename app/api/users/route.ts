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

export async function OPTIONS() {
  // Cette route répond aux requêtes préflight CORS
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://projet-pgl-hockey-4nh3.vercel.app",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://projet-pgl-hockey-4nh3.vercel.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const { action, ...data } = await req.json();
    const prisma = await getPrismaClient();

    try {
      if (action === "create") {
        if (data.password) data.password = await bcrypt.hash(String(data.password), 10);

        let user;
        try {
          user = await prisma.user.create({
            data: {
              ...data,
              dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
            },
          });
        } catch (err) {
          if ((err as unknown as { code?: string }).code === "P2002") {
            return NextResponse.json(
              { success: false, message: "Email déjà utilisé" },
              { status: 409, headers: corsHeaders }
            );
          }
          throw err;
        }

        return NextResponse.json({ success: true, user }, { headers: corsHeaders });
      }

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
            { status: 401, headers: corsHeaders }
          );
        }

        if (!user.password) {
          return NextResponse.json(
            { success: false, message: "Mot de passe non défini pour cet utilisateur" },
            { status: 401, headers: corsHeaders }
          );
        }

        const passwordMatches = await bcrypt.compare(String(password), user.password);
        if (!passwordMatches) {
          return NextResponse.json(
            { success: false, message: "Mot de passe incorrect" },
            { status: 401, headers: corsHeaders }
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...userSafe } = user;
        return NextResponse.json({ success: true, user: userSafe }, { headers: corsHeaders });
      }

      return NextResponse.json(
        { success: false, message: "Action inconnue" },
        { status: 400, headers: corsHeaders }
      );
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/users:", message);
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}

//fonction pour supprimer un user
export async function DELETE(req: Request) {
  const prisma = await getPrismaClient();

  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id");
    let password: string | undefined;

    if (!id) {
      // try JSON body — accept id = 0 and coerce types
      try {
        const body = await req.json();
        if (body && (body.id || body.id === 0)) {
          id = String(body.id);
          password = body.password ? String(body.password) : undefined;
        }
      } catch (err: unknown) {
        void err;
      }
    }

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: "Paramètre 'id' manquant ou invalide" }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id: parseInt(id, 10) } });
    if (!userToDelete) {
      return NextResponse.json({ success: false, message: "Utilisateur introuvable" }, { status: 404 });
    }

    if (!password) {
      return NextResponse.json({ success: false, message: "Mot de passe requis" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, userToDelete.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Mot de passe incorrect" }, { status: 401 });
    }

    await prisma.user.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur DELETE /api/users:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function GET() {
  try {
    const prisma = await getPrismaClient();
    const users = await prisma.user.findMany();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: getErrorMessage(error) }, { status: 500 });
  }
}

