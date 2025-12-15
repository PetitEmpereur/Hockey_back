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

export async function OPTIONS() {
  return new Response(null, {
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
    const data = await req.json();
    const prisma = await getPrismaClient();


    if (!data.title || !data.date || !data.startTime || !data.endTime) {
      return NextResponse.json(
        { success: false, message: "Champs obligatoires manquants" },
        { status: 400, headers: corsHeaders }
      );
    }

    const newEntrainement = await prisma.entrainement.create({
      data: {
        title: String(data.title),
        date: new Date(data.date),
        startTime: String(data.startTime),
        endTime: String(data.endTime),
        type: data.type ?? "technique",
        level: data.level ?? "tous",
        coach: String(data.coach ?? ""),
        location: String(data.location ?? ""),
        description: String(data.description ?? ""),
      },
    });

    return NextResponse.json({ success: true, entrainement: newEntrainement }, { headers: corsHeaders });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/entrainements:", message);
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
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
      const entrainements = await prisma.entrainement.findMany();
      return NextResponse.json(entrainements);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/entrainements:", message);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}
