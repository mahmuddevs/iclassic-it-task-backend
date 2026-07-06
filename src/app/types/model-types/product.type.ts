import type { Document } from "mongoose";

export interface IProduct {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image?: string;
}

export type IProductDocument = IProduct & Document;
