import { Product } from "./productModel";
import { User } from "./userModel";

export interface Order{
    _id : string,
    userId: User,
    orderDetails: {
        products:[{
            product: Product,
            quantity: number,
        }],
        total:number
    },
    orderDate: Date,
    verified: Boolean,
    trackingInfo: string
}