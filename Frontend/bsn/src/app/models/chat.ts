import { Product } from "./product";

export interface Chat{
    sender: string,
    receiver: string,
    ownerId: string;
    product: string,
    message: string,
    timestamp: Date,
  }