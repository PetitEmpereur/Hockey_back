import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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

    const championnat = await prisma.championnat.create({
      data,
    });

    return NextResponse.json({ success: true, championnat });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/championnats:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const championnats = await prisma.championnat.findMany();
    return NextResponse.json(championnats);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/championnats:", message);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}
