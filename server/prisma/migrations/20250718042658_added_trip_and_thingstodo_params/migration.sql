/*
  Warnings:

  - The primary key for the `ThingstodoOnTrips` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `timeOfDay` on the `ThingstodoOnTrips` table. All the data in the column will be lost.
  - Added the required column `durationMins` to the `ThingstodoOnTrips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `ThingstodoOnTrips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `ThingstodoOnTrips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ThingstodoOnTrips" DROP CONSTRAINT "ThingstodoOnTrips_pkey",
DROP COLUMN "timeOfDay",
ADD COLUMN     "durationMins" INTEGER NOT NULL,
ADD COLUMN     "endTime" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "startTime" INTEGER NOT NULL,
ADD CONSTRAINT "ThingstodoOnTrips_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
