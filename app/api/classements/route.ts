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

    const classement = await prisma.classement.create({
      data,
    });

    return NextResponse.json({ success: true, classement });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/cluclassementsbs:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const classements = await prisma.classement.findMany();
    return NextResponse.json(classements);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/classements:", message);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}
