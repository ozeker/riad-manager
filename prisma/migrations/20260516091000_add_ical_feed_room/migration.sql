-- Associate each iCal feed with the room/listing it imports into.
ALTER TABLE "IcalFeed" ADD COLUMN "roomId" TEXT;

CREATE INDEX "IcalFeed_roomId_idx" ON "IcalFeed"("roomId");
