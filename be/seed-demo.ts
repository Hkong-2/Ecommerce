import { PrismaClient } from '@prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
config();

const connectionString = process.env.DATABASE_URL as string;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  console.log('Tạo sản phẩm demo giá 10,000 VND...');

  // 1. Tạo Category
  const category = await prisma.category.upsert({
    where: { slug: 'phu-kien-demo' },
    update: {},
    create: {
      name: 'Phụ kiện Demo',
      slug: 'phu-kien-demo',
      description: 'Danh mục dùng để test',
    },
  });

  // 2. Tạo Brand
  const brand = await prisma.brand.upsert({
    where: { slug: 'brand-test' },
    update: {},
    create: {
      name: 'Test Brand',
      slug: 'brand-test',
      description: 'Brand dùng để test',
    },
  });

  // 3. Tạo Product
  const product = await prisma.product.upsert({
    where: { slug: 'san-pham-test-thanh-toan' },
    update: {
      isActive: true,
    },
    create: {
      name: 'Sản phẩm Test Thanh Toán VNPay',
      slug: 'san-pham-test-thanh-toan',
      description: 'Đây là sản phẩm demo để test thanh toán với giá 10.000 VNĐ',
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/000/356/804/non_2x/vector-test-icon.jpg',
      categoryId: category.id,
      brandId: brand.id,
      isActive: true,
    },
  });

  // 4. Tạo SKU
  const sku = await prisma.sKU.upsert({
    where: { skuCode: 'TEST-PAYMENT-10K' },
    update: { price: 10000, stock: 999 },
    create: {
      productId: product.id,
      skuCode: 'TEST-PAYMENT-10K',
      price: 10000,
      originalPrice: 15000,
      stock: 999,
      attributes: {
        "color": "Mặc định"
      }
    },
  });

  console.log('Đã tạo thành công!');
  console.log('Sản phẩm:', product.name);
  console.log('Giá bán:', sku.price, 'VND');
  console.log('Số lượng kho:', sku.stock);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
