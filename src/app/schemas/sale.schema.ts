import { z } from "zod"

export const CreateSaleSchema = z.object({
  products: z
    .array(
      z.object({
        product: z
          .string({ message: "Product ID is required" })
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format"),
        quantity: z.coerce
          .number({ message: "Quantity is required" })
          .int("Quantity must be an integer")
          .min(1, "Quantity must be at least 1"),
      }),
      { message: "Products list is required" }
    )
    .min(1, "A sale must contain at least one product"),
  paidAmount: z.coerce
    .number({ message: "Paid Amount is required" })
    .min(0, "Paid Amount cannot be negative"),
})

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
