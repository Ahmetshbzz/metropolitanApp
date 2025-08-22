//  "product.ts"
//  metropolitan app
//  Copied to mobile-app local shared

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  category: string;
  categorySlug?: string;
  categoryName?: string;
  description?: string;
  brand: string;
  size?: string;
  currency?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
