export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductImage {
  id: number;
  productId: number;
  skuId: number | null;
  imageUrl: string;
  altText: string | null;
}

export interface SKU {
  id: number;
  productId: number;
  skuCode: string;
  originalPrice: number | null;
  price: number;
  stock: number;
  attributes: Record<string, any>;
  images?: ProductImage[];
}

export interface ProductDetail {
  id: number;
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  techSpecs: Record<string, any> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  skus: SKU[];
}
