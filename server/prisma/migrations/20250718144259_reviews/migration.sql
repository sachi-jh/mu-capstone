-- AlterTable
ALTER TABLE "Park" ADD COLUMN     "avg_rating" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Review" (
    "locationId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("locationId","authorId")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Park"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
