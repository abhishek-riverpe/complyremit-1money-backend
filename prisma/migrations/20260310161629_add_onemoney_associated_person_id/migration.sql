-- AlterTable
ALTER TABLE "associated_persons" ADD COLUMN "onemoney_associated_person_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "associated_persons_onemoney_associated_person_id_key" ON "associated_persons"("onemoney_associated_person_id");
