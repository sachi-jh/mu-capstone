/*
  Warnings:

  - A unique constraint covering the columns `[park_id]` on the table `Park` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_url` to the `Park` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Park" ADD COLUMN     "image_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image_url" TEXT NOT NULL DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png';

-- CreateIndex
CREATE UNIQUE INDEX "Park_park_id_key" ON "Park"("park_id");
