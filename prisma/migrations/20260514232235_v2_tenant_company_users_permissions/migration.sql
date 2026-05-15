/*
  Warnings:

  - You are about to drop the column `name` on the `PlatformUser` table. All the data in the column will be lost.
  - You are about to drop the column `roleTemplateId` on the `PlatformUser` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TenantUser` table. All the data in the column will be lost.
  - You are about to drop the column `roleTemplateId` on the `TenantUser` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OtpPurpose" ADD VALUE 'TENANT_REGISTRATION';
ALTER TYPE "OtpPurpose" ADD VALUE 'TENANT_OWNER_CHANGE_EMAIL';

-- DropForeignKey
ALTER TABLE "PlatformUser" DROP CONSTRAINT "PlatformUser_roleTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUser" DROP CONSTRAINT "TenantUser_roleTemplateId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "otherName" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "PlatformUser" DROP COLUMN "name",
DROP COLUMN "roleTemplateId",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "otherName" TEXT,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "RoleTemplate" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "TenantUser" DROP COLUMN "name",
DROP COLUMN "roleTemplateId",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "otherName" TEXT,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "phone" TEXT;
