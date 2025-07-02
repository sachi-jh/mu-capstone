/*
  Warnings:

  - You are about to drop the column `park_id` on the `Park` table. All the data in the column will be lost.
  - You are about to drop the column `associated_park_id` on the `Thingstodo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[npsParkCode]` on the table `Park` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `npsParkCode` to the `Park` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Thingstodo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Thingstodo" DROP CONSTRAINT "Thingstodo_associated_park_id_fkey";

-- DropIndex
DROP INDEX "Park_park_id_key";

-- AlterTable
ALTER TABLE "Park" DROP COLUMN "park_id",
ADD COLUMN     "npsParkCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Thingstodo" DROP COLUMN "associated_park_id",
ADD COLUMN     "locationId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Park_npsParkCode_key" ON "Park"("npsParkCode");

-- AddForeignKey
ALTER TABLE "Thingstodo" ADD CONSTRAINT "Thingstodo_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Park"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
