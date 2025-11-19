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

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Paramètre 'id' manquant" }, { status: 400 });
    }

    const prisma = await getPrismaClient();
    try {
      await prisma.user.delete({
        where: { id: parseInt(id, 10) },
      });
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

