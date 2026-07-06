import { Router } from "express"
import { authorize } from "../../middlewares/authorize.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import { setUploadDir, upload } from "../../config/multer.js"
import { CreateProductSchema, UpdateProductSchema } from "../../schemas/product.schema.js"
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/product.controller.js"

const productRoutes = Router()

productRoutes.get("/", authorize("products.read"), getAllProducts)
productRoutes.get("/:id", authorize("products.read"), getProductById)

productRoutes.post(
  "/",
  authorize("products.create"),
  setUploadDir("uploads/products"),
  upload.single("image"),
  validate(CreateProductSchema),
  createProduct
)

productRoutes.put(
  "/:id",
  authorize("products.update"),
  setUploadDir("uploads/products"),
  upload.single("image"),
  validate(UpdateProductSchema),
  updateProduct
)

productRoutes.delete("/:id", authorize("products.delete"), deleteProduct)

export default productRoutes
