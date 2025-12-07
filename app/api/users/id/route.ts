import { NextResponse } from "next/server";

// Disable static generation for dynamic route handlers
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const prisma = await getPrismaClient();
  const id = Number(params.id);

  // Validate id
  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json(
      { success: false, message: "ID utilisateur invalide" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userSafe } = user;
    return NextResponse.json({ success: true, user: userSafe });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur GET /api/users/[id]:", message);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaClient();
  const id = Number(params.id);

  // Validate id
  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json(
      { success: false, message: "ID utilisateur invalide" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    // Do not allow updating password via this endpoint (use dedicated endpoint)
    if (data.password) {
      return NextResponse.json(
        { success: false, message: "Utilise /api/users/[id]/password pour changer le mot de passe" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userSafe } = user;
    return NextResponse.json({ success: true, user: userSafe });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Erreur PUT /api/users/[id]:", message);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
