-- Saved addresses: who receives the parcel, a landmark, and soft delete
-- (past orders keep pointing at an address the customer removed).
ALTER TABLE "Address" ADD COLUMN "fullName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Address" ALTER COLUMN "fullName" DROP DEFAULT;
ALTER TABLE "Address" ADD COLUMN "landmark" TEXT;
ALTER TABLE "Address" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Wishlist kept on the account, so it follows the customer to any device.
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");

ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
