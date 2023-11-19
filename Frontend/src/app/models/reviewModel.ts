import { Product } from "./productModel";
import { User } from "./userModel";

export interface Review {
    rating: number,
    review: string,
    reviewDate: Date,
    user: User,
    product: Product
    averageRating:number
  }
  