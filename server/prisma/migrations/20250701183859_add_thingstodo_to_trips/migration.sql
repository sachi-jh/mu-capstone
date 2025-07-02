/*
  Warnings:

  - The `image_url` column on the `Park` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Park" DROP COLUMN "image_url",
ADD COLUMN     "image_url" TEXT[];

-- CreateTable
CREATE TABLE "_ThingstodoToTrip" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ThingstodoToTrip_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ThingstodoToTrip_B_index" ON "_ThingstodoToTrip"("B");

-- AddForeignKey
ALTER TABLE "_ThingstodoToTrip" ADD CONSTRAINT "_ThingstodoToTrip_A_fkey" FOREIGN KEY ("A") REFERENCES "Thingstodo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ThingstodoToTrip" ADD CONSTRAINT "_ThingstodoToTrip_B_fkey" FOREIGN KEY ("B") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
