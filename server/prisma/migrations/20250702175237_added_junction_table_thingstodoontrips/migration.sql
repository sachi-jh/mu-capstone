/*
  Warnings:

  - You are about to drop the column `details` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the `_ThingstodoToTrip` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `days` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `authUserId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_ThingstodoToTrip" DROP CONSTRAINT "_ThingstodoToTrip_A_fkey";

-- DropForeignKey
ALTER TABLE "_ThingstodoToTrip" DROP CONSTRAINT "_ThingstodoToTrip_B_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "details",
ADD COLUMN     "days" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authUserId",
ADD COLUMN     "authUserId" UUID NOT NULL;

-- DropTable
DROP TABLE "_ThingstodoToTrip";

-- CreateTable
CREATE TABLE "ThingstodoOnTrips" (
    "tripId" INTEGER NOT NULL,
    "thingstodoId" INTEGER NOT NULL,
    "tripDay" INTEGER NOT NULL,
    "timeOfDay" INTEGER NOT NULL,

    CONSTRAINT "ThingstodoOnTrips_pkey" PRIMARY KEY ("thingstodoId","tripId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");

-- AddForeignKey
ALTER TABLE "ThingstodoOnTrips" ADD CONSTRAINT "ThingstodoOnTrips_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThingstodoOnTrips" ADD CONSTRAINT "ThingstodoOnTrips_thingstodoId_fkey" FOREIGN KEY ("thingstodoId") REFERENCES "Thingstodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
