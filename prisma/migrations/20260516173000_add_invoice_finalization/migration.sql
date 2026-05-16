ALTER TABLE "Invoice" ADD COLUMN "finalNumber" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "finalizedAt" DATETIME;
CREATE UNIQUE INDEX "Invoice_finalNumber_key" ON "Invoice"("finalNumber");
