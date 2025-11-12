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

    const user = await prisma.user.create({
      data,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur POST /api/users:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/users:", message);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}
