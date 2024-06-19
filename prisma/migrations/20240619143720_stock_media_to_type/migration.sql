/*
  Warnings:

  - You are about to drop the column `media` on the `Stock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "media",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'media';
