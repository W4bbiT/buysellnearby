import { Review } from "./reviewModel";

export interface Product{
    _id : string,
    productName: string,
    category: string,
    price: number,
    discount: number,
    description: string,
    reviews: Review[],
    productImage: [string],
    createdOn: Date,
    inStock: number,
    featureProduct: Boolean,
    details: {
        size:string,
        color:string,
        info:string
    }
}