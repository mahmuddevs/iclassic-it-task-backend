import type { Document, Types } from "mongoose";

export interface ISaleItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface ISale {
  invoiceId: string;
  products: ISaleItem[];
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;
}

export type ISaleDocument = ISale & Document;
