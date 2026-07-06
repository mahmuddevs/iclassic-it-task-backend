import { z } from "zod"

export const CreateProductSchema = z.object({
  name: z
    .string({ message: "Product Name is required" })
    .trim()
    .min(1, "Product Name cannot be empty"),
  sku: z
    .string({ message: "SKU is required" })
    .trim()
    .min(1, "SKU cannot be empty"),
  category: z
    .string({ message: "Category is required" })
    .trim()
    .min(1, "Category cannot be empty"),
  purchasePrice: z.coerce
    .number({ message: "Purchase Price is required" })
    .min(0, "Purchase Price cannot be negative"),
  sellingPrice: z.coerce
    .number({ message: "Selling Price is required" })
    .min(0, "Selling Price cannot be negative"),
  stockQuantity: z.coerce
    .number({ message: "Stock Quantity is required" })
    .min(0, "Stock Quantity cannot be negative"),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
