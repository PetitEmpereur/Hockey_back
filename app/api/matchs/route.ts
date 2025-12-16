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
    const body = await req.json();
    const payload = {
      titre: body.titre,
      dateHeure: new Date(body.dateHeure),  
      lieu: body.lieu,
      prix: Number(body.prix),
      description: body.description || "",
      salle: body.salle || "",
      type: body.type,  
      
    };
    const prisma = await getPrismaClient();

    const match = await prisma.match.create({
      data: payload,
    });

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error("Erreur POST /api/matchs:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaClient();

  try {
    await prisma.match.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur ADMIN DELETE match:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaClient();

  try {
    const body = await req.json();

    const updatedMatch = await prisma.match.update({
      where: { id: Number(params.id) },
      data: body,
    });

    return NextResponse.json({
      success: true,
      match: updatedMatch,
    });
  } catch (error) {
    console.error('Erreur ADMIN PUT match:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const prisma = await getPrismaClient();
    try {
      const matchs = await prisma.match.findMany();
      return NextResponse.json(matchs);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/matchs:", message);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}
