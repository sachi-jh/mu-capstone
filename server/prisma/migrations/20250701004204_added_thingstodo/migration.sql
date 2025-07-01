-- CreateTable
CREATE TABLE "Thingstodo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "associated_park_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Thingstodo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Thingstodo" ADD CONSTRAINT "Thingstodo_associated_park_id_fkey" FOREIGN KEY ("associated_park_id") REFERENCES "Park"("park_id") ON DELETE RESTRICT ON UPDATE CASCADE;
