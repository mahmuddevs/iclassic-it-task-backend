import type { Request, Response } from "express"
import mongoose, { type Types } from "mongoose"
import { Product } from "../models/product.model.js"
import { Sale } from "../models/sale.model.js"
import { response } from "../utils/apiResponse.js"
import { buildQuery } from "../utils/queryBuilder.js"

interface SaleProductInput {
  product: string;
  quantity: number;
}

const mergeDuplicateProducts = (products: SaleProductInput[]): SaleProductInput[] => {
  const mergedMap = new Map<string, number>()
  for (const item of products) {
    const cleanId = item.product.trim()
    const currentQty = mergedMap.get(cleanId) || 0
    mergedMap.set(cleanId, currentQty + item.quantity)
  }
  return Array.from(mergedMap.entries()).map(([productId, quantity]) => ({
    product: productId,
    quantity,
  }))
}

const rollbackStock = async (successfullyUpdated: { productId: string; quantity: number }[]): Promise<void> => {
  if (successfullyUpdated.length === 0) return
  await Promise.all(
    successfullyUpdated.map((rolledBack) =>
      Product.findByIdAndUpdate(rolledBack.productId, {
        $inc: { stockQuantity: rolledBack.quantity },
      })
    )
  )
}

// 1. Create Sale
export const createSale = async (req: Request, res: Response) => {
  const { products, paidAmount } = req.body
  const successfullyUpdated: { productId: string; quantity: number }[] = []

  try {
    // Merge any duplicate products to prevent incorrect validation and race states
    const mergedProducts = mergeDuplicateProducts(products)
    const productIds = mergedProducts.map((p) => p.product)

    // Query required fields using lean() since the query is read-only
    const dbProducts = await Product.find(
      { _id: { $in: productIds } },
      { _id: 1, name: 1, sku: 1, category: 1, stockQuantity: 1, sellingPrice: 1 }
    ).lean()

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]))
    const saleItems = []
    const receiptProducts = []
    let grandTotal = 0

    // Perform validation and calculate grandTotal concurrently in a single loop
    for (const item of mergedProducts) {
      const dbProduct = productMap.get(item.product)

      if (!dbProduct) {
        return response.error(res, {
          message: `Product with ID ${item.product} not found`,
          statusCode: 400,
        })
      }

      if (dbProduct.stockQuantity < item.quantity) {
        return response.error(res, {
          message: `Insufficient stock for product "${dbProduct.name}". Available: ${dbProduct.stockQuantity}, Requested: ${item.quantity}`,
          statusCode: 400,
        })
      }

      grandTotal += dbProduct.sellingPrice * item.quantity

      saleItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        unitPrice: dbProduct.sellingPrice,
      })

      receiptProducts.push({
        product: {
          _id: dbProduct._id.toString(),
          name: dbProduct.name,
          sku: dbProduct.sku,
          category: dbProduct.category,
        },
        quantity: item.quantity,
        unitPrice: dbProduct.sellingPrice,
      })
    }

    // Perform atomic stock reduction with filter conditions
    for (const item of saleItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      )

      if (!updatedProduct) {
        await rollbackStock(successfullyUpdated)
        return response.error(res, {
          message: `Failed to secure stock for product ID: ${item.product}. It may have been sold in a concurrent request.`,
          statusCode: 400,
        })
      }

      successfullyUpdated.push({
        productId: item.product.toString(),
        quantity: item.quantity,
      })
    }

    const dueAmount = paidAmount >= grandTotal ? 0 : grandTotal - paidAmount
    const changeAmount = paidAmount >= grandTotal ? paidAmount - grandTotal : 0

    const invoiceId = "INV-" + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);

    // Create Sale History record in the DB
    const sale = await Sale.create({
      invoiceId,
      products: saleItems,
      grandTotal,
      paidAmount,
      dueAmount,
      changeAmount,
    })

    const createdSale = sale as unknown as { _id: Types.ObjectId; createdAt: Date; updatedAt: Date }

    const responseData = {
      _id: createdSale._id,
      invoiceId,
      products: receiptProducts,
      grandTotal,
      paidAmount,
      dueAmount,
      changeAmount,
      createdAt: createdSale.createdAt,
      updatedAt: createdSale.updatedAt,
    }

    return response.success(res, {
      message: "Sale processed successfully",
      data: responseData,
      statusCode: 201,
    })
  } catch (error: unknown) {
    await rollbackStock(successfullyUpdated)
    const errorMessage = error instanceof Error ? error.message : "Failed to process sale"
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    })
  }
}

// 2. Get Sales History (Search, Filter, Sort, Paginate)
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const query = buildQuery(Sale, req.query)
    query.modelQuery = query.modelQuery.populate("products.product")

    const result = await query
      .search(["invoiceId"])
      .filter()
      .sort()
      .paginate()
      .execute()

    return response.success(res, {
      message: "Sales history retrieved successfully",
      data: {
        sales: result.data,
        meta: result.meta,
      },
      statusCode: 200,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve sales history"
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    })
  }
}

// 3. Delete Sale (Delete Record & Optional Rollback Stock)
export const deleteSale = async (req: Request, res: Response) => {
  const { id } = req.params
  const restoreStock = req.query.restoreStock === "true" || req.body?.restoreStock === true || req.body?.restoreStock === "true"

  try {
    const sale = await Sale.findById(id)

    if (!sale) {
      return response.error(res, {
        message: "Sale not found",
        statusCode: 404,
      })
    }

    await Sale.findByIdAndDelete(id)

    if (restoreStock) {
      const itemsToRollback = sale.products.map((item) => ({
        productId: item.product.toString(),
        quantity: item.quantity,
      }))
      await rollbackStock(itemsToRollback)
    }

    return response.success(res, {
      message: restoreStock
        ? "Sale deleted and stock restored successfully"
        : "Sale deleted successfully",
      statusCode: 200,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete sale"
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    })
  }
}
