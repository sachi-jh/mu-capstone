/*
  Warnings:

  - Added the required column `durationMins` to the `Thingstodo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Thingstodo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Thingstodo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thingstodo" ADD COLUMN     "durationMins" INTEGER NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "season" TEXT[],
ADD COLUMN     "timeOfDay" TEXT[];
