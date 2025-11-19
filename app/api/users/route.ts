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
    const data = await req.json();

    const prisma = await getPrismaClient();
    try {
      const user = await prisma.user.create({
        data,
      });

      return NextResponse.json({ success: true, user });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/users:", message);
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

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { success: false, message: "ID invalide" },
        { status: 400 }
      );
    }

    const prisma = await getPrismaClient();

    try {
      const deleted = await prisma.user.deleteMany({
        where: { id }
      });

      if (deleted.count === 0) {
        return NextResponse.json(
          { success: false, message: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      await prisma.$disconnect();
    }
  }catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
