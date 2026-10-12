-- AlterTable
ALTER TABLE "ImagingOrder" ADD COLUMN     "reportEnteredByStaffId" INTEGER;

-- CreateIndex
CREATE INDEX "ImagingOrder_reportEnteredByStaffId_idx" ON "ImagingOrder"("reportEnteredByStaffId");

-- AddForeignKey
ALTER TABLE "ImagingOrder" ADD CONSTRAINT "ImagingOrder_reportEnteredByStaffId_fkey" FOREIGN KEY ("reportEnteredByStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
