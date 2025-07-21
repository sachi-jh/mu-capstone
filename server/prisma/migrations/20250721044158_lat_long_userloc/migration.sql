/*
  Warnings:

  - You are about to drop the column `address` on the `Park` table. All the data in the column will be lost.
  - Added the required column `userLocationLat` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userLocationLong` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Park" DROP COLUMN "address";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userLocationLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "userLocationLong" DOUBLE PRECISION NOT NULL;
