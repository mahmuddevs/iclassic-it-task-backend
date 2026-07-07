import { Schema, model } from "mongoose"
import type { ISale } from "../types/model-types/sale.type.js"

const SaleItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const SaleSchema = new Schema<ISale>(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    products: {
      type: [SaleItemSchema],
      required: true,
      validate: [
        (val: any[]) => val.length > 0,
        "A sale must contain at least one product"
      ],
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    changeAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

export const Sale = model<ISale>("Sale", SaleSchema)
