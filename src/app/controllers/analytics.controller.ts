import type { Request, Response } from "express"
import { Product } from "../models/product.model.js"
import { Sale } from "../models/sale.model.js"
import { response } from "../utils/apiResponse.js"

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const [totalProducts, salesAggregate, lowStockProducts] = await Promise.all([
      Product.estimatedDocumentCount(),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: "$grandTotal" } } }
      ]),
      Product.countDocuments({ stockQuantity: { $lt: 5 } }),
    ])

    const totalSales = salesAggregate[0]?.total || 0

    return response.success(res, {
      message: "Dashboard analytics retrieved successfully",
      data: {
        totalProducts,
        totalSales,
        lowStockProducts,
      },
      statusCode: 200,
    })
  } catch (error: any) {
    return response.error(res, {
      message: error.message || "Failed to retrieve analytics",
      statusCode: 500,
    })
  }
}
