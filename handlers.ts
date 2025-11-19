export async function getPrismaClient() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  try { return String(error); } catch { return "Erreur inconnue"; }
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
