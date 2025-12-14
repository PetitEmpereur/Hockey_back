import { PrismaClient } from '@prisma/client'; //début d'uniformisation des requette prisma/client pour éviter la sur demande de connexion à la BDD à chaque requette

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({ log: ['query', 'error'] });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
