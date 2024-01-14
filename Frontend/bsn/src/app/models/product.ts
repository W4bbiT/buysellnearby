import { UserApi } from "./user";
export interface ApiResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
}

export interface Product {
  _id: string;
  owner: UserApi;
  productName: string;
  category: string[];
  price: number;
  description: string;
  inStock: number;
  featureProduct: boolean;
  details: string;
  productImages: ProductImage[];
  createdOn: Date;
}

interface ProductImage {
  path: string;
  _id: string;
}