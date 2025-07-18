/*
  Warnings:

  - You are about to drop the column `avg_rating` on the `Park` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Park" DROP COLUMN "avg_rating",
ADD COLUMN     "avgRating" DOUBLE PRECISION;
