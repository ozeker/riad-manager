-- Add import tracking so repeated iCal imports can update existing bookings.
ALTER TABLE "Booking" ADD COLUMN "importedFromFeedId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "externalEventId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "importedAt" DATETIME;

CREATE UNIQUE INDEX "Booking_importedFromFeedId_externalEventId_key" ON "Booking"("importedFromFeedId", "externalEventId");
