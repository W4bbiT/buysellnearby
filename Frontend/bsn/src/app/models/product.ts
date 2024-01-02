export interface Product {
  _id: string;
  owner: string;
  productName: string;
  category: string[];
  price: number;
  description: string;
  inStock: number;
  featureProduct: boolean;
  details: string;
  productImages: ProductImage[];
  createdOn: string;
}

export interface ProductImage {
  path: string;
  _id: string;
}