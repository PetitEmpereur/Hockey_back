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

    const match = await prisma.match.create({
      data,
    });

    return NextResponse.json({ success: true, match });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/matchs:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const matchs = await prisma.match.findMany();
    return NextResponse.json(matchs);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/matchs:", message);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}
