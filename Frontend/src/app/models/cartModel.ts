import { Product } from "./productModel"
import { User } from "./userModel"

export interface Cart{
    _id : string,
    userId: User,
    products: [{
        productId: Product,
        price: number,
        discount: number,
        quantity: number,

    }],
    total: number
}