/*
  Warnings:

  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('user', 'admin');

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyImage" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "identityDocument" TEXT,
ADD COLUMN     "legalStatus" TEXT,
ADD COLUMN     "rib" TEXT,
ADD COLUMN     "role" "Roles" NOT NULL,
ADD COLUMN     "siret" TEXT;

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "UserRole";

-- CreateTable
CREATE TABLE "AgentIA" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tarif" DOUBLE PRECISION NOT NULL,
    "job" TEXT NOT NULL,
    "skills" TEXT[],
    "description" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "AgentIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAgentIA" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentIAId" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAgentIA_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentIA" ADD CONSTRAINT "AgentIA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAgentIA" ADD CONSTRAINT "UserAgentIA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAgentIA" ADD CONSTRAINT "UserAgentIA_agentIAId_fkey" FOREIGN KEY ("agentIAId") REFERENCES "AgentIA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
