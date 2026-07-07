import type { Request, Response } from "express"
import { Product } from "../models/product.model.js"
import { response } from "../utils/apiResponse.js"
import { buildQuery } from "../utils/queryBuilder.js"
import { logger } from "../utils/logger.js"
import fs from "node:fs/promises"

// Helper function to safely delete a file from disk
const deleteFile = async (path?: string) => {
  if (!path) return
  try {
    await fs.unlink(path)
  } catch (err) {
    logger.warn(`Failed to delete file at ${path}: ${(err as Error).message}`)
  }
}

// 1. Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { sku } = req.body
    const existingProduct = await Product.findOne({ sku })
    if (existingProduct) {
      if (req.file) {
        await deleteFile(req.file.path)
      }
      return response.error(res, {
        message: "Product with this SKU already exists",
        statusCode: 400,
      })
    }

    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : undefined
    const product = await Product.create({
      ...req.body,
      image: imagePath,
    })

    return response.success(res, {
      message: "Product created successfully",
      data: product,
      statusCode: 201,
    })
  } catch (error: any) {
    if (req.file) {
      await deleteFile(req.file.path)
    }
    return response.error(res, {
      message: error.message || "Failed to create product",
      statusCode: 500,
    })
  }
}

// 2. Get All Products (Search, Filter, Sort, Paginate)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const result = await buildQuery(Product, req.query)
      .search(["name", "sku", "category"])
      .filter()
      .sort()
      .paginate()
      .execute()

    return response.success(res, {
      message: "Products retrieved successfully",
      data: {
        products: result.data,
        meta: result.meta,
      },
      statusCode: 200,
    })
  } catch (error: any) {
    return response.error(res, {
      message: error.message || "Failed to retrieve products",
      statusCode: 500,
    })
  }
}

// 3. Get Product By ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return response.error(res, {
        message: "Product not found",
        statusCode: 404,
      })
    }

    return response.success(res, {
      message: "Product retrieved successfully",
      data: product,
      statusCode: 200,
    })
  } catch (error: any) {
    return response.error(res, {
      message: error.message || "Failed to retrieve product",
      statusCode: 500,
    })
  }
}

// 4. Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { sku } = req.body
    const product = await Product.findById(req.params.id)
    if (!product) {
      if (req.file) {
        await deleteFile(req.file.path)
      }
      return response.error(res, {
        message: "Product not found",
        statusCode: 404,
      })
    }

    // Check SKU uniqueness if it's changing
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku })
      if (existingProduct) {
        if (req.file) {
          await deleteFile(req.file.path)
        }
        return response.error(res, {
          message: "Product with this SKU already exists",
          statusCode: 400,
        })
      }
    }

    let imagePath = product.image
    if (req.file) {
      // Delete old file if a new one is uploaded
      if (product.image) {
        await deleteFile(product.image)
      }
      imagePath = req.file.path.replace(/\\/g, "/")
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: imagePath,
      },
      { new: true, runValidators: true }
    )

    return response.success(res, {
      message: "Product updated successfully",
      data: updatedProduct,
      statusCode: 200,
    })
  } catch (error: any) {
    if (req.file) {
      await deleteFile(req.file.path)
    }
    return response.error(res, {
      message: error.message || "Failed to update product",
      statusCode: 500,
    })
  }
}

// 5. Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return response.error(res, {
        message: "Product not found",
        statusCode: 404,
      })
    }

    // Delete image file from disk
    if (product.image) {
      await deleteFile(product.image)
    }

    await Product.findByIdAndDelete(req.params.id)

    return response.success(res, {
      message: "Product deleted successfully",
      statusCode: 200,
    })
  } catch (error: any) {
    return response.error(res, {
      message: error.message || "Failed to delete product",
      statusCode: 500,
    })
  }
}

// 6. Get All Unique Product Categories
export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct("category")
    const filteredCategories = categories.filter((cat) => typeof cat === "string" && cat.trim() !== "")

    return response.success(res, {
      message: "Categories fetched successfully",
      data: filteredCategories,
      statusCode: 200,
    })
  } catch (error: any) {
    return response.error(res, {
      message: error.message || "Failed to fetch categories",
      statusCode: 500,
    })
  }
}
