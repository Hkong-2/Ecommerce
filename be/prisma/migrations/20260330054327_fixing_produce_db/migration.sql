-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "techSpecs" JSONB,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "SKU" ADD COLUMN     "originalPrice" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
