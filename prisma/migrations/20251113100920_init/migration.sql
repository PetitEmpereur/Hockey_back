-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LevelT" AS ENUM ('Dep', 'Reg', 'Nat', 'EU', 'Inter');

-- CreateEnum
CREATE TYPE "Post" AS ENUM ('Gardien', 'Defenceur', 'Centre', 'Ailier');

-- CreateEnum
CREATE TYPE "Categorie" AS ENUM ('Coatch', 'Player', 'Anonyme', 'All', 'Directeur');

-- CreateEnum
CREATE TYPE "LevelP" AS ENUM ('Junior', 'Senior', 'Debutant', 'Intermediaire', 'Confirme', 'The_GOAT', 'Expert');

-- CreateEnum
CREATE TYPE "Equipement" AS ENUM ('Cross', 'Casque', 'Plastron', 'Protege', 'Maillot', 'Patins', 'Accessoir_gardien');

-- CreateEnum
CREATE TYPE "Merch" AS ENUM ('Maillot', 'Veste', 'Gobelet', 'Echarpe');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "numero" INTEGER,
    "dateNaissance" TIMESTAMP(3),
    "photoProfil" TEXT,
    "numeroLicence" TEXT,
    "substituer" BOOLEAN NOT NULL DEFAULT false,
    "info" TEXT,
    "suspension" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "heure" TIMESTAMP(3),
    "lieu" TEXT NOT NULL,
    "score" INTEGER,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "logo" TEXT,
    "dateCreation" TIMESTAMP(3),
    "valeur" DOUBLE PRECISION,
    "capital" DOUBLE PRECISION,
    "info" TEXT,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatUserMatch" (
    "id" SERIAL NOT NULL,
    "buts" INTEGER NOT NULL DEFAULT 0,
    "passes" INTEGER NOT NULL DEFAULT 0,
    "cartonsJaunes" INTEGER NOT NULL DEFAULT 0,
    "cartonsRouges" INTEGER NOT NULL DEFAULT 0,
    "tempsJeu" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatUserMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Championnat" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "saison" TEXT NOT NULL,

    CONSTRAINT "Championnat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classement" (
    "id" SERIAL NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "victoires" INTEGER NOT NULL DEFAULT 0,
    "defaites" INTEGER NOT NULL DEFAULT 0,
    "nuls" INTEGER NOT NULL DEFAULT 0,
    "difference" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actualite" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "image" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Actualite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrainement" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "heure" TIMESTAMP(3),
    "lieu" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entrainement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
