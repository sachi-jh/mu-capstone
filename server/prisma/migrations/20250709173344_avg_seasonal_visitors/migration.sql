/*
  Warnings:

  - Added the required column `fall_avg_visitors` to the `Park` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spring_avg_visitors` to the `Park` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summer_avg_visitors` to the `Park` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winter_avg_visitors` to the `Park` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Park" ADD COLUMN     "fall_avg_visitors" INTEGER NOT NULL,
ADD COLUMN     "spring_avg_visitors" INTEGER NOT NULL,
ADD COLUMN     "summer_avg_visitors" INTEGER NOT NULL,
ADD COLUMN     "winter_avg_visitors" INTEGER NOT NULL;
